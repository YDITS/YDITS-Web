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
    constructor() {
        this.gmt = null;
        this.year = null;
        this.month = null;
        this.day = null;
        this.hour = null;
        this.minute = null;
        this.second = null;
    }

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
