import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const inputDate = new Date(control.value);
        const currentDate = new Date();

        const age = currentDate.getFullYear() - inputDate.getFullYear();
        const isBeforeBirthday = (currentDate.getMonth() < inputDate.getMonth()) ||
            (currentDate.getMonth() === inputDate.getMonth() && currentDate.getDate() < inputDate.getDate());

        const validAge = age > minAge || (age === minAge && !isBeforeBirthday);

        return validAge ? null : { 'ageInvalid': { value: control.value } };
    };
}
