const BottomNav = document.querySelector(".bottom-nav");
const tabs = document.querySelectorAll(".tab");
const NavButtons = document.querySelectorAll(".bottom-nav button");

NavButtons.forEach(button => {
  button.addEventListener("click", () => {

    const tab = button.dataset.tab;

    if (tab === "home") {
      window.location.replace('../');
    } else if (tab === "contracts") {
      window.location.href = './contracts/';
    } else if (tab === "settings") {
      window.location.href = './settings/';
    }

  });
});