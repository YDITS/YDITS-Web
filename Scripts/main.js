//
// main.js | YDITS for Web
//
// (c) 2022-2023 よね/Yone
//
// No modification or reproduction of any kind is permitted.
// 改変や複製を一切禁じます。
//
const version = "3.5.0";
document.addEventListener('DOMContentLoaded', initPage);


// -------------------- Functions -------------------- //
function initPage() {
    init_commonElements();
}


function init_commonElements() {
    $("header").load("./elements/header.html");
    $("footer").load("./elements/footer.html");
}


function win(winId, winTitle) {
    $('body').append(`
        <dialog class="dialog" id=${winId}>
            <div class="navBar">
                <p class="title"></p>
                <span class="close material-symbols-outlined">close</span>
            </div>
        
            <div class="content">
            </div>
        </dialog>
    `);

    $(`#${winId} .navBar .title`).text(winTitle);

    $(document).on('click', `#${winId} .navBar .close`, function () {
        $(`#${winId}`).remove()
    })
};
