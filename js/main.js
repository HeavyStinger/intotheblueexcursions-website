const menuBtn = document.getElementById("menu-btn");
const navLinksMobile = document.getElementById("nav-links-mobile");

menuBtn.addEventListener("click", () => {
    navLinksMobile.classList.toggle("active");
});