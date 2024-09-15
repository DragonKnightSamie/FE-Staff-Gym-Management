import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Equipment } from 'app/types/equipment.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EquipmentService {

    private _equipment: BehaviorSubject<Equipment | null> = new BehaviorSubject(null);
    private _equipments: BehaviorSubject<Equipment[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for equipment
 */
    get equipment$(): Observable<Equipment> {
        return this._equipment.asObservable();
    }

    /**
     * Getter for equipments
     */
    get equipments$(): Observable<Equipment[]> {
        return this._equipments.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getEquipments(filter: any = {}):
        Observable<{ pagination: Pagination; data: Equipment[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Equipment[] }>('/api/admin/equipments/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._equipments.next(response.data);
            }),
        );
    }

    /**
     * Get equipment by id
     */
    getEquipmentById(id: string): Observable<Equipment> {
        return this.equipments$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Equipment>('/api/admin/equipments/' + id).pipe(
                map((equipment) => {

                    // Set value for current equipment
                    this._equipment.next(equipment);

                    // Return the new contact
                    return equipment;
                })
            ))
        );
    }

    /**
* Create equipment
*/
    createEquipment(data) {
        return this.equipments$.pipe(
            take(1),
            switchMap((equipments) => this._httpClient.post<Equipment>('/api/admin/equipments', data).pipe(
                map((newEquipment) => {

                    // Update equipment list with current page size
                    this._equipments.next([newEquipment, ...equipments].slice(0, this._pagination.value.pageSize));

                    return newEquipment;
                })
            ))
        )
    }

    /**
    * Update equipment
    */
    updateEquipment(id: string, data) {
        return this.equipments$.pipe(
            take(1),
            switchMap((equipments) => this._httpClient.put<Equipment>('/api/admin/equipments/' + id, data).pipe(
                map((updatedEquipment) => {

                    // Find and replace updated equipment
                    const index = equipments.findIndex(item => item.id === id);
                    equipments[index] = updatedEquipment;
                    this._equipments.next(equipments);

                    // Update equipment
                    this._equipment.next(updatedEquipment);

                    return updatedEquipment;
                })
            ))
        )
    }

    deleteEquipment(id: string): Observable<boolean> {
        return this.equipments$.pipe(
            take(1),
            switchMap(equipments => this._httpClient.delete('/api/admin/equipments/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = equipments.findIndex(item => item.id === id);

                    // Delete the product
                    equipments.splice(index, 1);

                    // Update the equipments
                    this._equipments.next(equipments);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}