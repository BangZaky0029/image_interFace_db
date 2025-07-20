export function showMessage(msg, error = false) {
  const success = document.getElementById('successMessage');
  const err = document.getElementById('errorMessage');
  success.style.display = error ? 'none' : 'block';
  err.style.display = error ? 'block' : 'none';
  (error ? err : success).textContent = msg;
  setTimeout(() => {
    success.style.display = 'none';
    err.style.display = 'none';
  }, 5000);
}
