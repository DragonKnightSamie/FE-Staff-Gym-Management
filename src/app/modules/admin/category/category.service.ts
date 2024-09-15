import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from 'app/types/category.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {

    private _category: BehaviorSubject<Category | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<Category[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for category
 */
    get category$(): Observable<Category> {
        return this._category.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<Category[]> {
        return this._categories.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getCategories(filter: any = {}):
        Observable<{ pagination: Pagination; data: Category[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Category[] }>('/api/categories/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._categories.next(response.data);
            }),
        );
    }

    /**
     * Get category by id
     */
    getCategoryById(id: string): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Category>('/api/categories/' + id).pipe(
                map((category) => {

                    // Set value for current category
                    this._category.next(category);

                    // Return the new contact
                    return category;
                })
            ))
        );
    }

    /**
* Create category
*/
    createCategory(data) {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) => this._httpClient.post<Category>('/api/categories', data).pipe(
                map((newCategory) => {

                    // Update category list with current page size
                    this._categories.next([newCategory, ...categories].slice(0, this._pagination.value.pageSize));

                    return newCategory;
                })
            ))
        )
    }

    /**
    * Update category
    */
    updateCategory(id: string, data) {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) => this._httpClient.put<Category>('/api/categories/' + id, data).pipe(
                map((updatedCategory) => {

                    // Find and replace updated category
                    const index = categories.findIndex(item => item.id === id);
                    categories[index] = updatedCategory;
                    this._categories.next(categories);

                    // Update category
                    this._category.next(updatedCategory);

                    return updatedCategory;
                })
            ))
        )
    }

    deleteCategory(id: string): Observable<boolean> {
        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._httpClient.delete('/api/categories/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = categories.findIndex(item => item.id === id);

                    // Delete the product
                    categories.splice(index, 1);

                    // Update the categories
                    this._categories.next(categories);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}