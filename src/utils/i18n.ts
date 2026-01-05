import { I18n } from "@grammyjs/i18n";
import { MyContext } from "utils/customTypes";
import localeNegotiator from "utils/localeNegotiator";

const i18n = new I18n<MyContext>({
    defaultLocale: "en", 
    directory: "src/locales",
    fluentBundleOptions: { useIsolating: false },
    localeNegotiator: localeNegotiator
});

export default i18n;