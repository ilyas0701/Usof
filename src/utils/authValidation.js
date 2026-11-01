const LOGIN_REGEX = /^[a-zA-Z0-9_]{3,255}$/

export function validateCredentials({ login, password, passwordConfirmation }) {
  const errors = {}

  if (!login.trim()) {
    errors.login = 'Enter your username'
  } else if (!LOGIN_REGEX.test(login.trim())) {
    errors.login = 'Use 3 to 255 characters: Latin letters, digits, and underscores'
  }

  if (!password) {
    errors.password = 'Enter your password'
  } else if (password.length < 3) {
    errors.password = 'Password must be at least 3 characters long'
  }

  if (!passwordConfirmation) {
    errors.passwordConfirmation = 'Confirm your password'
  } else if (password !== passwordConfirmation) {
    errors.passwordConfirmation = 'Passwords do not match'
  }

  return errors
}
