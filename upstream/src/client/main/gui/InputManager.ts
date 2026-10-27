import jQuery from "jquery";
import { IInputManager, InputManagerCallback, InputManagerValidator } from "../../../compiler/common/interpreter/IInputManager";
import { MainBase } from "../MainBase";
import { PrintManager } from "./PrintManager";
import { InternalKeyboardListener } from "../../../compiler/common/interpreter/KeyboardManager";

export class InputManager implements IInputManager {

    $input: JQuery<HTMLInputElement>;

    constructor(private $runDiv: JQuery<HTMLElement>, private main: MainBase) {

    }

    waitForKey(keys: string[] | undefined, successCallback: InputManagerCallback) {
        let keyboardManager = this.main.getInterpreter()?.keyboardManager;
        if(!keyboardManager) successCallback(undefined);

        if(keys && keys.length > 0){
            for(let key of keys){
                if(keyboardManager.isPressed(key)){
                    successCallback(key);
                    return;
                }
            }
        } else {
            if(keyboardManager.isAnyKeyPressed()) {
                successCallback(keyboardManager.getAnyPressedKey());
                return;
            }
        }

        let keyboardListener: InternalKeyboardListener = 
        {
            onKeyDown:(key: string, isShift: boolean, isCtrl: boolean, isAlt: boolean) => {
                if(!keys || keys.length == 0){
                    keyboardManager.removeInternalKeyboardListener(keyboardListener);
                    successCallback(key);
                    return;
                } 
                if(keys.indexOf(key) >= 0){
                    keyboardManager.removeInternalKeyboardListener(keyboardListener);
                    successCallback(key);
                    return;
                } 
            },
            looseKeyboardFocus:() => {}
        }

        keyboardManager.addInternalKeyboardListener(keyboardListener);
    }


    readInput(message: string, defaultValue: string | undefined, validator: InputManagerValidator, successCallback: InputManagerCallback): void {

        let printManager: PrintManager = <PrintManager>this.main.getInterpreter().printManager;

        if (message != null && message != "") {
            printManager.beginOfLineState = true;
            printManager.print("\n" + message, true, undefined);
            printManager.flush();
        }

        this.$input = jQuery('<input class="jo_newInput" type="text"/>');

        let $od = printManager.$outputDiv;
        $od.append(this.$input);

        let dvt = defaultValue == null ? "" : defaultValue;
        this.$input.val(dvt);
        if (defaultValue) {
            this.$input[0].selectionStart = 0;
            this.$input[0].selectionEnd = ("" + defaultValue).length;
        }

        let that = this;

        this.$input.on('keydown', (e) => {
            if (e.key == "Enter") {
                let value: string = <string>(this.$input.val()) || '';
                let validatorRet = validator(value);

                if (validatorRet.errorMessage) {
                    this.$input.detach();
                    printManager.print(validatorRet.errorMessage, true, 0xff0000);
                    printManager.flush();
                    printManager.$outputDiv.append(this.$input);
                    let inputField: HTMLInputElement = this.$input[0];
                    inputField.scrollIntoView();
                    inputField.focus();

                    inputField.selectionStart = 0;
                    inputField.selectionEnd = (inputField.value || '').length;
                } else {
                    printManager.$outputDiv.off('mousedown.inputmanager');
                    printManager.print(value, true, 0xffffff);
                    this.$input.off('keydown');
                    this.hide();

                    successCallback(validatorRet.convertedValue);
                }
                // e.preventDefault();
                // return false;
            }

        })

        setTimeout(() => {
            that.$input.focus();
        }, 200);

        printManager.$outputDiv.on('mousedown.inputmanager', (e) => {
            setTimeout(() => {
                that.$input?.focus();
            }, 200);
        })

     }

     hide(){

        if(this.$input != null){
            this.$input.remove();
            this.$input = null;
        }

    }


}