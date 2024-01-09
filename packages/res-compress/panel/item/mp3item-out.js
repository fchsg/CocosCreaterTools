const Fs = require('fire-fs');
const Msg = Editor.require('packages://res-compress/panel/msg.js');

module.exports = () => {
    Vue.component('mp3-item-out', {
        props: ['data', 'index'],
        template: Fs.readFileSync(Editor.url('packages://res-compress/panel/item/mp3item-out.html', 'utf8')) + "",
        created () {
        },
        methods: {
            onBtnClickCompress () {
                // this.data.isUse=!this.data.isUse;
                // console.log("on use: " + this.data.isUse);
                // console.log("压缩");
                // console.log(this.data);
                this.$root.$emit(Msg.CompressAudioOut, this.data);
            }
        },
        computed: {},
    });
}
