/*
 *
 * datetime.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class Datetime {
    gmt = null;
    year = null;
    month = null;
    day = null;
    hour = null;
    minute = null;
    second = null;


    constructor() { }


    async update() {
        await axios.head(window.location.href, { headers: { 'Cache-Control': 'no-cache' } })
            .then(response => {
                this.gmt = new Date(response.headers.date);
                this.year = this.gmt.getFullYear();
                this.month = this.gmt.getMonth() + 1;
                this.day = this.gmt.getDate();
                this.hour = this.gmt.getHours();
                this.minute = this.gmt.getMinutes();
                this.second = this.gmt.getSeconds();
            }).catch(error => { });
    }
}
