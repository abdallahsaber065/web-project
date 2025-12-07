if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        hideMessage('error-message');

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            setAuth(data.data.token, data.data.user);

            const user = data.data.user;
            if (user.role === 'admin' || user.role === 'librarian') {
                window.location.href = './admin.html';
            } else {
                window.location.href = './dashboard.html';
            }
        } catch (error) {
            showError('error-message', error.message);
        }
    });
}

if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        hideMessage('error-message');
        hideMessage('success-message');

        if (password !== confirmPassword) {
            showError('error-message', 'Passwords do not match');
            return;
        }

        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            showSuccess('success-message', 'Registration successful! Redirecting to login...');

            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);
        } catch (error) {
            showError('error-message', error.message);
        }
    });
}
