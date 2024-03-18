import {Pipe, PipeTransform} from "@angular/core";
import * as moment from 'moment';

@Pipe({
  name: 'changeFormat',
  pure: true
})
export class ChangeDateFormatPipe implements PipeTransform {
  transform(value: number): any {
    if (!value) { return "---"};
    return moment(value).format('DD/MM/YYYY HH:mm')
  }
}
