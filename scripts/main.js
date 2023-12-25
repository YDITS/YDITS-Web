/*
 *
 * main.js | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

const version = "3.9.0";

function initCommonElements() {
    $("header").load("./elements/header.html");
    $("footer").load("./elements/footer.html");
}

function win(type, winId, winTitle, content) {
    let color = null;

    switch (type) {
        case "message":
            color = "#404040ff";
            break;

        case "error":
            color = "#ff5050ff";
            break;

        default:
            color = "#404040ff";
            break;
    }

    $('body')
        .append(`
            <dialog class="dialog" id=${winId}>
                <div class="navBar">
                    <p class="title">${winTitle}</p>
                    <span class="close material-symbols-outlined">close</span>
                </div>
            
                <div class="content">
                    ${content}
                </div>
            </dialog>
        `);

    $(document).on('click', `#${winId}>.navBar>.close`, (event) => {
        $(`#${winId}`).remove()
    })

    $(`#${winId}>.navBar`).css({
        "background-color": color
    })
};

document.addEventListener('DOMContentLoaded', () => {
    initCommonElements();
});
