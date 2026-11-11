import 'package:dio/dio.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import 'auth_provider.dart';

class PasswordResetScreen extends ConsumerStatefulWidget {
  const PasswordResetScreen({super.key, this.initialEmail = ''});

  final String initialEmail;

  @override
  ConsumerState<PasswordResetScreen> createState() => _PasswordResetScreenState();
}

class _PasswordResetScreenState extends ConsumerState<PasswordResetScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _codeRequested = false;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmation = true;
  String? _message;
  String? _error;
  String? _devCode;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _requestCode({bool validate = true}) async {
    if (validate && !_emailFormKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final devCode = await ref
          .read(authProvider.notifier)
          .requestPasswordReset(_emailController.text);
      if (!mounted) return;
      setState(() {
        _codeRequested = true;
        _devCode = devCode;
        _message = 'Si un compte correspond à cette adresse, un code de réinitialisation vient de lui être envoyé.';
        if (devCode != null) _codeController.text = devCode;
      });
    } on DioException catch (exception) {
      if (!mounted) return;
      setState(() => _error = _dioMessage(exception));
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Impossible de traiter la demande pour le moment. Réessayez.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitNewPassword() async {
    if (!_resetFormKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await ref.read(authProvider.notifier).resetPassword(
            email: _emailController.text,
            code: _codeController.text,
            newPassword: _passwordController.text,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mot de passe modifié. Vous pouvez vous connecter.'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.of(context).pop();
    } on DioException catch (exception) {
      if (!mounted) return;
      setState(() => _error = _dioMessage(exception));
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Impossible de réinitialiser le mot de passe. Vérifiez le code et réessayez.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _dioMessage(DioException exception) {
    if (exception.type == DioExceptionType.connectionError ||
        exception.type == DioExceptionType.connectionTimeout ||
        exception.type == DioExceptionType.receiveTimeout) {
      return 'Une connexion internet est nécessaire pour recevoir le code et réinitialiser le mot de passe.';
    }

    final responseData = exception.response?.data;
    if (responseData is Map) {
      final detail = responseData['detail'] ?? responseData['message'];
      if (detail is String && detail.isNotEmpty) return detail;
      final nested = responseData['data'];
      if (nested is Map && nested['message'] is String) return nested['message'] as String;
    }

    return 'La demande a échoué. Vérifiez les informations saisies et réessayez.';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Scaffold(
      appBar: AppBar(title: const Text('Mot de passe oublié')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.mark_email_read_outlined, color: AppColors.primary, size: 40),
                    const SizedBox(height: 12),
                    Text(
                      _codeRequested ? 'Saisissez le code reçu' : 'Recevoir un code par e-mail',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _codeRequested
                          ? 'Le code envoyé à votre adresse est valable 15 minutes.'
                          : 'Indiquez l’adresse e-mail associée à votre compte Poulvia.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textMutedLight, fontSize: 13),
                    ),
                    const SizedBox(height: 22),
                    Form(
                      key: _emailFormKey,
                      child: TextFormField(
                        controller: _emailController,
                        enabled: !_isLoading && !_codeRequested,
                        keyboardType: TextInputType.emailAddress,
                        autocorrect: false,
                        autofillHints: const [AutofillHints.email],
                        decoration: const InputDecoration(
                          labelText: 'Adresse e-mail',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        validator: (value) {
                          final email = value?.trim() ?? '';
                          if (email.isEmpty) return 'Saisissez votre adresse e-mail.';
                          if (!email.contains('@') || !email.contains('.')) {
                            return 'Adresse e-mail invalide.';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _isLoading ? null : () => _requestCode(),
                      icon: _isLoading
                          ? const SizedBox.square(
                              dimension: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.send_outlined),
                      label: Text(_codeRequested ? 'Renvoyer le code' : 'Envoyer le code'),
                    ),
                    if (_codeRequested) ...[
                      const SizedBox(height: 18),
                      Form(
                        key: _resetFormKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            TextFormField(
                              controller: _codeController,
                              enabled: !_isLoading,
                              keyboardType: TextInputType.number,
                              textInputAction: TextInputAction.next,
                              maxLength: 6,
                              decoration: const InputDecoration(
                                labelText: 'Code à 6 chiffres',
                                prefixIcon: Icon(Icons.pin_outlined),
                                counterText: '',
                              ),
                              validator: (value) {
                                if (value == null || !RegExp(r'^\d{6}$').hasMatch(value.trim())) {
                                  return 'Saisissez le code à 6 chiffres reçu par e-mail.';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _passwordController,
                              enabled: !_isLoading,
                              obscureText: _obscurePassword,
                              autofillHints: const [AutofillHints.newPassword],
                              decoration: InputDecoration(
                                labelText: 'Nouveau mot de passe',
                                helperText: '8 caractères minimum',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                  icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.length < 8) {
                                  return 'Le mot de passe doit comporter au moins 8 caractères.';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _confirmPasswordController,
                              enabled: !_isLoading,
                              obscureText: _obscureConfirmation,
                              textInputAction: TextInputAction.done,
                              decoration: InputDecoration(
                                labelText: 'Confirmer le mot de passe',
                                prefixIcon: const Icon(Icons.lock_reset_outlined),
                                suffixIcon: IconButton(
                                  onPressed: () => setState(() => _obscureConfirmation = !_obscureConfirmation),
                                  icon: Icon(_obscureConfirmation ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                                ),
                              ),
                              validator: (value) {
                                if (value != _passwordController.text) return 'Les mots de passe ne correspondent pas.';
                                return null;
                              },
                              onFieldSubmitted: (_) {
                                if (!_isLoading) _submitNewPassword();
                              },
                            ),
                            const SizedBox(height: 18),
                            ElevatedButton(
                              onPressed: _isLoading ? null : _submitNewPassword,
                              child: _isLoading
                                  ? const SizedBox.square(
                                      dimension: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Text('Modifier le mot de passe'),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (_message != null) ...[
                      const SizedBox(height: 14),
                      _Notice(message: _message!, color: AppColors.success),
                    ],
                    if (_devCode != null) ...[
                      const SizedBox(height: 10),
                      _Notice(message: 'Code de test local : $_devCode', color: AppColors.info),
                    ],
                    if (_error != null) ...[
                      const SizedBox(height: 10),
                      _Notice(message: _error!, color: AppColors.danger),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Notice extends StatelessWidget {
  const _Notice({required this.message, required this.color});

  final String message;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(message, style: TextStyle(color: color, fontSize: 13)),
    );
  }
}
