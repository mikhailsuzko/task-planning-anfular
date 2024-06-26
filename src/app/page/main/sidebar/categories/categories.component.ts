import {Component, effect, EventEmitter, Input, input, Output} from '@angular/core';
import {Category} from "../../../../dto/Category";
import {DeviceDetectorService} from "ngx-device-detector";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {EditCategoryComponent} from "../../../dialog/edit-category/edit-category.component";
import {DialogAction, DialogResult} from "../../../../model/DialogResult";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {CategorySearchValues} from "../../../../model/SearchObjects";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {Stat} from "../../../../dto/Stat";

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    NgForOf,
    NgClass,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatListModule,FormsModule,
    FormsModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  isMobile: boolean;
  showSidebar = input.required<boolean>();
  @Output() toggleSidebarEvent = new EventEmitter<boolean>();

  stat = input.required<Stat>();
  categories = input.required<Category[]>();
  filteredCategories!: Category[];

  @Output() addCategoryEvent = new EventEmitter<Category>();
  @Output() updateCategoryEvent = new EventEmitter<Category>();
  @Output() deleteCategoryEvent = new EventEmitter<Category>();
  @Output() selectedCategoryEvent = new EventEmitter<Category>();

  searchTitle = "";
  categorySearchValues: CategorySearchValues = new CategorySearchValues("");

  emptyCategory = new Category('');
  @Input() selectedCategory!: Category;

  constructor(detectorService: DeviceDetectorService,
              public dialog: MatDialog,
              private translateService: TranslateService) {
    this.isMobile = detectorService.isMobile()
    effect(() => {
      if (this.categories()) {
        this.filteredCategories = this.categories();
        this.search();
      }
    });
  }

  addCategory() {
    const dialog = this.dialog.open(EditCategoryComponent, {
      width: '300',
      data: {category: new Category(''), title: this.translateService.instant('CATEGORY.ADDING')}
    });
    dialog.afterClosed().subscribe((result: DialogResult) => {
      console.log('The dialog was closed');
      const category = result.obj as Category;
      console.log('action: ' + DialogAction[result.action] + ', ' + (category ? category : 'null'));
      if (result.action == DialogAction.SAVE) {
        this.addCategoryEvent.emit(category);
      }
    })
  }


  edit(category: Category) {
    const dialog = this.dialog.open(EditCategoryComponent, {
      width: '300',
      data: {category: category, title: this.translateService.instant('CATEGORY.ADDING')}
    });
    dialog.afterClosed().subscribe((result: DialogResult) => {
      console.log('The dialog was closed');
      const category = result.obj;
      console.log('action: ' + DialogAction[result.action] + ', ' + (category ? category : 'null'));
      if (result.action == DialogAction.SAVE) {
        this.updateCategoryEvent.emit(result.obj as Category);
      } else if (result.action == DialogAction.DELETE) {
        this.deleteCategoryEvent.emit(result.obj as Category);
      }
    })
  }

  toggleMenu() {
    this.toggleSidebarEvent.emit()
  }

  clearAndSearch(): void {
    this.searchTitle = "";
    this.search();
  }

  search(): void {
    const title = this.searchTitle.toLowerCase();
    const newArr: Category[] = [];
    this.categorySearchValues.title = this.searchTitle
    this.categories().forEach(function (category) {
      if (category.title.toLowerCase().includes(title)) {
        newArr.push(category);
      }
    });
    this.filteredCategories = newArr;
  }

  showCategory(category: Category) {
    if (this.selectedCategory !== category) {
      this.selectedCategory = category;
      this.selectedCategoryEvent.emit(this.selectedCategory);
    }
  }
}
