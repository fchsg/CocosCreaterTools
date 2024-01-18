const Fs = require('fire-fs');
const Msg = Editor.require('packages://res-compress/panel/msg.js');

module.exports = () => {
    Vue.component('obfuscation-log-item', {
        props: ['data', 'index'],
        template: Fs.readFileSync(Editor.url('packages://res-compress/panel/item/obfuscation-log-item.html'), 'utf-8'),
        created () {
        },
        methods: {
            onBtnClickObfuscate () {
                this.$root.$emit(Msg.ExecuteObfuscate, this.data);
            },
            onBtnClickOpen(){
                this.$root.$emit(Msg.OpenObfuscateFolder, this.data);
            }
        },
        computed: {},
    });
}
