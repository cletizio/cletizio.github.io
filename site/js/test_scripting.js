// script.js

document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('profile-info')) {
        getUserProfile();
    }
    
    // User Registration Form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Check if passwords match
            if (password !== confirmPassword) {
                document.getElementById('message').innerText = 'Passwords do not match!';
                return;
            }

            if (!firstName || !lastName){
                document.getElementById('message').innerText = 'First name and Last name are required.';
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, firstName, lastName, password })
                });
                const data = await response.json();
                if (response.ok) {
                    document.getElementById('message').innerText = data.message || data.error;
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Redirect to login if registration is successful.
                    }, 2000);
                } else {
                    document.getElementById('message').innerText = data.error;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // User Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }) 
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token); // Store the token in localStorage
                    document.getElementById('message').innerText = 'Login successful!';
                    setTimeout(() => {
                        window.location.href = 'profile.html'; // Redirect to profile page after login
                    }, 2000);
                } else {
                    document.getElementById('message').innerText = data.error;
                }
            } catch (error){
                console.error('Error:', error);
            }
        });
    }

    const test = document.getElementById('quiz');
    if (test) {
        test.addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = localStorage.getItem('token');
            let userData = { firstName: '', lastName: ''};
            
            if (token) {
                try {
                    const response = await fetch('http://localhost:8080/api/auth/profile', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await response.json();
                    if (response.ok) {
                        userData.firstName = data.firstName;
                        userData.lastName = data.lastName;
                        generateCertificate(score, totalQuestions, userData);
                    } else {
                        console.error('Failed to fetch user profile data: ', data.error);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                console.error('No token found. User not logged in.');
            }
        });
    }

    const testForm = document.getElementById('test-form');
    if(testForm) {
        testForm.addEventListener('submit', function(e) {
            e.preventDefault();

            handleSubmit();
        });
    }

    // Fetch User Profile
    async function getUserProfile() {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        
        if (!token) {
            console.error('No token found');
            document.getElementById('message').innerText = 'You need to log in first.';
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Pass the token in the authorization header
                }
            });

            const data = await response.json();
            if (response.ok) {
                const firstName = data.firstName; // Store firstName globally
                const lastName = data.lastName; // Store lastName globally
                const userData = { firstName, lastName }
                displayUserProfile(data); // Display the retrieved user data
            } else {
                document.getElementById('message').innerText = data.error || 'Failed to fetch profile data.';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again later.';
        }
    }

    // Function to display user profile data
    function displayUserProfile(user) {
        const profileInfo = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>First Name:</strong> ${user.firstName}</p>
            <p><strong>Last Name:</strong> ${user.lastName}</p>
        `;
        document.getElementById('profile-info').innerHTML = profileInfo;
    }

    // Call function to fetch user profile on profile page
    if (document.getElementById('profile-info')) {
        getUserProfile();
    }

    document.getElementById('start-test')?.addEventListener('click',startTest);

    document.getElementById('logout')?.addEventListener('click', handleLogout);
});

function startTest(){
    window.location.href = 'index.html'; // Redirect to test page.
}

function handleSubmit() {
    console.log('Submitting answers');
    const correctAnswers = {
        q1: 'c',
        q2: 'b',
        q3: 'a',
        q4: 'd',
        q5: 'd',
        q6: 'b',
        q7: 'a',
        q8: 'a',
        q9: 'a',
        q10: 'b',
        // Add more correct answers here
    };
    const totalQuestions = Object.keys(correctAnswers).length;
    const userData = { firstName: 'John', lastName: 'Doe' }; // Example user data

    checkAnswers(correctAnswers, totalQuestions, userData);
}

function checkAnswers(correctAnswers, totalQuestions, userData) {
    console.log('Checking answers');
    let score = 0;
    for (let key in correctAnswers) {
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        if (selected && selected.value === correctAnswers[key]) {
            score++;
        }
    }

    const passingScore = Math.ceil(0.8 * totalQuestions);
    const pass = score >= passingScore;

    if (pass) {
        generateCertificate(score, totalQuestions, userData);
    } else {
        document.getElementById('results').innerText = `You did not pass. Your score was: ${score} / ${totalQuestions}. Passing score is ${passingScore}`;
    }
}

 // PDF Generation using jsPDF
 function generateCertificate(score, totalQuestions, userData) {
    console.log('Generating PDF....')
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Certification of Completion", 20, 20);
    doc.setFontSize(14);
    doc.text(`This certifies that ${userData.firstName} ${userData.lastName}` , 20, 40);
    doc.text(`has successfully completed the Duct Smoke Detector Certification Test.`, 20, 50);
    doc.text(`Score: ${score} / ${totalQuestions}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    
    // Save PDF
    doc.save('certificate.pdf');
}

function handleLogout() {
    // Remove token from local storage
    localStorage.removeItem('token');

    //Redirect to login page
    window.location.href = 'login.html';
}

