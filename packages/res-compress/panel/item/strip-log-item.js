const Fs = require('fire-fs');
const Msg = Editor.require('packages://res-compress/panel/msg.js');

module.exports = () => {
    Vue.component('strip-log-item', {
        props: ['data', 'index'],
        template: Fs.readFileSync(Editor.url('packages://res-compress/panel/item/strip-log-item.html'), 'utf-8'),
        created () {
        },
        methods: {
            onBtnClickStripLog () {
                this.$root.$emit(Msg.ExecuteStripLog, this.data);
            },
            onBtnClickOpen(){
                this.$root.$emit(Msg.OpenStripLog, this.data);
            }
        },
        computed: {},
    });
}
