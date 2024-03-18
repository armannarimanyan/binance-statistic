import {NgModule} from "@angular/core";
import {ChangeDateFormatPipe} from "./change-date-format.pipe";
import {CommonModule} from "@angular/common";

const pipes = [
  ChangeDateFormatPipe
]

@NgModule({
  declarations: pipes,
  imports: [
    CommonModule
  ],
  exports: pipes
})
export class PipesModule { }
