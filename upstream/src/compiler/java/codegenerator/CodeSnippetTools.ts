import { JavaTypeStore } from "../module/JavaTypeStore";
import { JavaType } from "../types/JavaType";
import { CodeSnippetContainer } from "./CodeSnippetKinds";
import { CodeSnippet } from "./CodeSnippet";
import { IRange } from "monaco-editor";

export class SnippetFramer {
    static frame(snippet: CodeSnippet, template: string, newType?: JavaType, enclosingRange?: IRange): CodeSnippet {

        let type = newType ? newType : snippet.type;
        if(!enclosingRange) enclosingRange = snippet.range;

        if(snippet.isPureTerm()){
                snippet.alterPureTerm(template.replace(new RegExp('\\§1', 'g'), () => snippet.getPureTerm()));
                snippet.type = type;
                return snippet;
        }

        let framedSnippet = new CodeSnippetContainer(snippet.allButLastPart(), enclosingRange, type);
        let lastPart = snippet.lastPartOrPop();
        framedSnippet.addStringPart(template.replace(new RegExp('\\§1', 'g'), () => lastPart.emit()), enclosingRange, type, [lastPart]);
        // if(snippet instanceof CodeSnippetContainer && snippet.endsWithNextStepMark()){
        //     framedSnippet.addNextStepMark();
        // }

        return framedSnippet;
    }

}

