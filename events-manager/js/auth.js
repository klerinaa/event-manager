const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");


loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});
registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}
function saveUser(users) {
    return localStorage.setItem('users', JSON.stringify(users));

}
registerForm.addEventListener('submit', e => {
    e.preventDefault();//pengon rolin defult the eventit
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;


    const messageEl = document.getElementById('register-message');
    messageEl.style.color = 'red';

    if (!username || !email || !password) {
        messageEl.textContent = "All field are required";
        return;
    }

    let users = getUsers();
    if (users[username]) {
        messageEl.textContent = "Username already exicts";
        return;
    }
    if (users[email]) {
        messageEl.textContent = "Email already exicts";
        return;
    }
    users[username] = {
        password,
        email,
        bio: '',
        events: []

    };
    console.log(users)
    saveUser(users);
    messageEl.style.color = 'green';
    messageEl.textContent = "Registration successful!You can login now .";
    registerForm.reset();

}
);

loginForm.addEventListener('submit', e => {
    e.preventDefault();//pengon rolin defult the eventit

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');
    messageEl.style.color = 'red';

    if (!username || !password) {
        messageEl.textContent = "Missing username or password ";
        return;
    }

    let users = getUsers();
    //using promise to mock the api service
    new Promise((resolve, reject) => {

        setTimeout(() => {
            if (users[username] && users[username].password === password) {
                resolve();
            }else{
                reject();
            }

        }, 1000);




    }).then(()=>{
        sessionStorage.setItem('loggedUser',username);
        window.location.href='dashboard.html'
    }).catch(()=>{
        messageEl.textContent="Invalid username or password";
    });


});


