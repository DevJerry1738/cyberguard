(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Jerry',
        lastName: 'Dev',
        email: 'devjerry1738@gmail.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        acceptTerms: true,
      }),
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log(text);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
