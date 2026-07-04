const menuBtn = document.getElementById("menu-btn");
const navLinksMobile = document.getElementById("nav-links-mobile");

menuBtn.addEventListener("click", () => {
    navLinksMobile.classList.toggle("active");
});

// Handle buttons

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("[skate-type]");
    const page = "./contact.html";

    buttons.forEach((button) => {
        const skateType = button.getAttribute("skate-type");
        if (skateType == "OG") {
            button.href = page;
        }
        else if (skateType.includes("Scenic Flights")) {
            const values = skateType.split("|");
            button.href = page + "?" + "servicetype=Scenic%20Flights" + "&service=" + values[1];
        }
        else if (skateType.includes("Snorkeling / Scuba Diving")) {
            const values = skateType.split("|");
            button.href = page + "?" + "servicetype=Snorkeling%20/%20Scuba Diving" + "&service=" + values[1];
        }
        else if (skateType.includes("Catamaran Tours")) {
            const values = skateType.split("|");
            button.href = page + "?" + "servicetype=Catamaran%20Tours" + "&service=" + values[1];
        }
        else {
            return;
        }

        button.href += "#contact-form";
    });
})