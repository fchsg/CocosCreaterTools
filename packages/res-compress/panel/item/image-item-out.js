const Fs = require('fire-fs');
const Msg = Editor.require('packages://res-compress/panel/msg.js');

module.exports = () => {
    Vue.component('image-item-out', {
        props: ['data', 'index'],
        template: Fs.readFileSync(Editor.url('packages://res-compress/panel/item/image-item-out.html'), 'utf-8'),
        created () {
        },
        methods: {
            onBtnClickCompress () {
                this.$root.$emit(Msg.CompressImageOut, this.data);
            },
            onBtnClickOpen(){
                this.$root.$emit(Msg.OpenImageOut, this.data);
            }
        },
        computed: {},
    });
}
