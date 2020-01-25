import {NumberRenderer, StringRenderer, TextRenderer} from "./Widgets/TextField";
import {Select, SelectMulti} from "./Widgets/Select";
import {BoolRenderer, OptionsCheck, OptionsRadio} from "./Widgets/Options";
import {Stepper, Step} from "./Widgets/Stepper";
import {RootRenderer, GroupRenderer, SchemaGridHandler} from "./Grid";
import {DefaultHandler, MinMaxValidator, TypeValidator, MultipleOfValidator, ValueValidatorEnum, ValueValidatorConst} from "@ui-schema/ui-schema";

const widgetStack = [
    SchemaGridHandler,
    DefaultHandler,
    MinMaxValidator,
    TypeValidator,
    MultipleOfValidator,
    ValueValidatorConst,
    ValueValidatorEnum,
];

const widgets = {
    RootRenderer,
    GroupRenderer,
    widgetStack,
    types: {
        string: StringRenderer,
        bool: BoolRenderer,
        boolean: BoolRenderer,
        number: NumberRenderer,
    },
    custom: {
        Text: TextRenderer,
        OptionsCheck,
        OptionsRadio,
        Select,
        SelectMulti,
        Stepper,
        Step,
    },
};

export {widgets};
