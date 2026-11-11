import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/models/subscription_plan.dart';
import '../auth/auth_provider.dart';

class SubscriptionState {
  final bool isLoading;
  final bool isSubmitting;
  final String? error;
  final String? successMessage;
  final SubscriptionPlanModel? currentPlan;
  final List<SubscriptionPlanModel> publicPlans;
  final String orgStatus;
  final String billingCycle; // 'MONTHLY', 'ANNUALLY'

  const SubscriptionState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
    this.successMessage,
    this.currentPlan,
    this.publicPlans = const [],
    this.orgStatus = 'ACTIVE',
    this.billingCycle = 'MONTHLY',
  });

  SubscriptionState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    String? error,
    String? successMessage,
    SubscriptionPlanModel? currentPlan,
    List<SubscriptionPlanModel>? publicPlans,
    String? orgStatus,
    String? billingCycle,
    bool clearError = false,
    bool clearSuccess = false,
  }) {
    return SubscriptionState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: clearError ? null : (error ?? this.error),
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
      currentPlan: currentPlan ?? this.currentPlan,
      publicPlans: publicPlans ?? this.publicPlans,
      orgStatus: orgStatus ?? this.orgStatus,
      billingCycle: billingCycle ?? this.billingCycle,
    );
  }
}

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  final ApiClient _apiClient;
  final Ref _ref;
  Timer? _paymentPollTimer;

  SubscriptionNotifier(this._apiClient, this._ref) : super(const SubscriptionState()) {
    loadSubscription();
  }

  void setBillingCycle(String cycle) {
    state = state.copyWith(billingCycle: cycle);
  }

  Future<void> loadSubscription({bool showLoading = true}) async {
    final activeFarm = _ref.read(authProvider).activeFarm;
    if (activeFarm == null) {
      state = state.copyWith(isLoading: false);
      return;
    }

    if (showLoading) {
      state = state.copyWith(isLoading: true, clearError: true, clearSuccess: true);
    }

    try {
      // 1. Charger le catalogue des offres
      final plansRes = await _apiClient.dio.get(ApiEndpoints.subscriptionPlans);
      final rawPlans = (plansRes.data['publicPlans'] as List<dynamic>?) ??
          (plansRes.data['data']?['publicPlans'] as List<dynamic>?) ??
          [];
      final publicPlans = rawPlans
          .map((p) => SubscriptionPlanModel.fromJson(p as Map<String, dynamic>))
          .toList();

      // 2. Charger le statut de la ferme active
      final farmPlanRes = await _apiClient.dio.get(
        ApiEndpoints.farmSubscription(activeFarm.id),
      );

      SubscriptionPlanModel? currentPlan;
      String status = 'ACTIVE';
      String billingCycle = 'MONTHLY';

      if (farmPlanRes.data['data'] != null) {
        final currentPlanMap = farmPlanRes.data['data']['currentPlan'] as Map<String, dynamic>?;
        if (currentPlanMap != null) {
          currentPlan = SubscriptionPlanModel.fromJson(currentPlanMap);
        }
        status = farmPlanRes.data['data']['orgStatus'] as String? ?? 'ACTIVE';
        final cycle = farmPlanRes.data['data']['billingCycle']?.toString().toUpperCase();
        if ((cycle == 'MONTHLY' || cycle == 'ANNUALLY') &&
            (currentPlan?.allowedBillingCycles.contains(cycle) ?? true)) {
          billingCycle = cycle!;
        }
      }

      state = state.copyWith(
        isLoading: false,
        publicPlans: publicPlans,
        currentPlan: currentPlan,
        orgStatus: status,
        billingCycle: billingCycle,
      );
    } on DioException catch (e) {
      String message = "Impossible de charger les formules d'abonnement.";
      if (e.response?.data is Map && e.response?.data['message'] != null) {
        message = e.response!.data['message'] as String;
      }
      state = state.copyWith(isLoading: false, error: message);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: "Erreur: $e");
    }
  }

  Future<String?> createCheckout({required String targetPlan}) async {
    final activeFarm = _ref.read(authProvider).activeFarm;
    if (activeFarm == null) return null;

    state = state.copyWith(isSubmitting: true, clearError: true, clearSuccess: true);

    try {
      final response = await _apiClient.dio.post(
        ApiEndpoints.subscriptionCheckout,
        data: {
          'farmId': activeFarm.id,
          'plan': targetPlan,
          'billingCycle': state.billingCycle,
        },
      );
      final data = response.data['data'] as Map<String, dynamic>?;
      final checkoutUrl = data?['checkoutUrl'] as String?;
      final paymentId = data?['id'] as String?;
      if (checkoutUrl == null || checkoutUrl.isEmpty || paymentId == null) {
        throw StateError("Le lien de paiement n’a pas été créé.");
      }
      state = state.copyWith(
        isSubmitting: false,
        successMessage: "Paiement lancé. En attente de confirmation sécurisée…",
      );
      _watchPayment(paymentId);
      return checkoutUrl;
    } on DioException catch (e) {
      String msg = "Erreur lors de la demande d'évolution d'offre.";
      if (e.response?.data is Map && e.response?.data['message'] != null) {
        msg = e.response!.data['message'] as String;
      }
      state = state.copyWith(isSubmitting: false, error: msg);
      return null;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: "Erreur: $e");
      return null;
    }
  }

  void _watchPayment(String paymentId) {
    _paymentPollTimer?.cancel();
    var attempts = 0;
    _paymentPollTimer = Timer.periodic(const Duration(seconds: 4), (timer) async {
      attempts++;
      try {
        final response = await _apiClient.dio.get(ApiEndpoints.subscriptionPaymentStatus(paymentId));
        final payment = response.data['data'] as Map<String, dynamic>?;
        final status = payment?['status']?.toString().toUpperCase();
        if (status == 'PAID') {
          timer.cancel();
          state = state.copyWith(successMessage: "Paiement confirmé. Abonnement activé.");
          await loadSubscription(showLoading: false);
        } else if (status == 'FAILED') {
          timer.cancel();
          state = state.copyWith(error: "Le paiement n’a pas été confirmé.");
        } else if (attempts >= 90) {
          timer.cancel();
          state = state.copyWith(successMessage: "La confirmation du paiement est toujours en attente. Revenez ici pour actualiser l’abonnement.");
        }
      } on DioException {
        if (attempts >= 90) timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _paymentPollTimer?.cancel();
    super.dispose();
  }
}

final subscriptionProvider = StateNotifierProvider<SubscriptionNotifier, SubscriptionState>((ref) {
  ref.watch(authProvider.select((s) => s.activeFarm?.id));
  return SubscriptionNotifier(ApiClient(), ref);
});
