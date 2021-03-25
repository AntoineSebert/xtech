function init() {
    const menuToogle = document.querySelector('.toggle');
    const showcase = document.querySelector('.showcase');

    menuToogle.addEventListener('click', () => {
        menuToogle.classList.toggle('active');
        showcase.classList.toggle('active');
    });
}