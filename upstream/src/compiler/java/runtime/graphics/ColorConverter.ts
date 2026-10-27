import * as THREE from 'three';
import { JRC } from "../../language/JavaRuntimeLibraryComments";
import { ColorHelper } from "../../lexer/ColorHelper";
import { RuntimeExceptionClass } from "../system/javalang/RuntimeException";
import { ColorClass } from "./ColorClass";

export class ColorConverter {
    static convertToInt(color: number | string | ColorClass, acceptNull: boolean = false): number {
        if(color == null) {
            if(acceptNull){
                return null;
            } else {
                throw new RuntimeExceptionClass(JRC.colorMustNotBeNull())
            }
        }

        if(typeof color == "number") return color;

        if(typeof color == "string"){
            return ColorHelper.parseColorToOpenGL(color).color || 0xffffff;
        }

        return color.red * 0x10000 + color.green * 0x100 + color.blue;
    }

    static convertToThreeJsColor(color: number | string | ColorClass) {
        return new THREE.Color(ColorConverter.convertToInt(color, false));
    }
}