function goToPage(pageNumber) {
    const container = document.getElementById('container');
    if (pageNumber === 2) {
        container.style.transform = 'translateX(-100vw)';
    } else {
        container.style.transform = 'translateX(0)';
    }
}
