
username=document.getElementById('username');
usernamevalidity=document.getElementById('usernamevalidity');
go=document.getElementById('go');

document.getElementById('go').addEventListener('click', function() {
    if(username===0){
        usernamevalidity.style.display='flex';
    }
})