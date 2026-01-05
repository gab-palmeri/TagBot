import { TranslateFn } from "utils/customTypes";

export default function generateDescription(translate: TranslateFn, action: "create" | "rename" | "delete" | "language-group" | "language-private", flagOrLang: number|string) {

    let selectedOption = "";

    switch(flagOrLang) {
        case 0:
            selectedOption = translate("settings.permissions-only-admins");
            break;
        case 1:
            selectedOption = translate("settings.permissions-everyone");
            break;
        case 2:
            selectedOption = translate("settings.permissions-admins-creators");
            break;
        default:
            selectedOption = flagOrLang.toString();
            break;
    }

    return translate(`settings.${action}-description`, {current: selectedOption});
}