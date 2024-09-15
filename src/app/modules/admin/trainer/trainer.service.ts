import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Trainer } from 'app/types/trainer.type';
import { Pagination } from 'app/types/pagination.type';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrainerService {

    private _trainer: BehaviorSubject<Trainer | null> = new BehaviorSubject(null);
    private _trainers: BehaviorSubject<Trainer[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
 * Getter for trainer
 */
    get trainer$(): Observable<Trainer> {
        return this._trainer.asObservable();
    }

    /**
     * Getter for trainers
     */
    get trainers$(): Observable<Trainer[]> {
        return this._trainers.asObservable();
    }

    /**
 * Getter for pagination
 */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    getTrainers(filter: any = {}):
        Observable<{ pagination: Pagination; data: Trainer[] }> {
        return this._httpClient.post<{ pagination: Pagination; data: Trainer[] }>('/api/trainers/filter', filter).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._trainers.next(response.data);
            }),
        );
    }

    /**
     * Get trainer by id
     */
    getTrainerById(id: string): Observable<Trainer> {
        return this.trainers$.pipe(
            take(1),
            switchMap(() => this._httpClient.get<Trainer>('/api/trainers/' + id).pipe(
                map((trainer) => {

                    // Set value for current trainer
                    this._trainer.next(trainer);

                    // Return the new contact
                    return trainer;
                })
            ))
        );
    }

    /**
* Create trainer
*/
    createTrainer(data) {
        return this.trainers$.pipe(
            take(1),
            switchMap((trainers) => this._httpClient.post<Trainer>('/api/trainers', data).pipe(
                map((newTrainer) => {

                    // Update trainer list with current page size
                    this._trainers.next([newTrainer, ...trainers].slice(0, this._pagination.value.pageSize));

                    return newTrainer;
                })
            ))
        )
    }

    /**
    * Update trainer
    */
    updateTrainer(id: string, data) {
        return this.trainers$.pipe(
            take(1),
            switchMap((trainers) => this._httpClient.put<Trainer>('/api/trainers/' + id, data).pipe(
                map((updatedTrainer) => {

                    // Find and replace updated trainer
                    const index = trainers.findIndex(item => item.id === id);
                    trainers[index] = updatedTrainer;
                    this._trainers.next(trainers);

                    // Update trainer
                    this._trainer.next(updatedTrainer);

                    return updatedTrainer;
                })
            ))
        )
    }

    deleteTrainer(id: string): Observable<boolean> {
        return this.trainers$.pipe(
            take(1),
            switchMap(trainers => this._httpClient.delete('/api/trainers/' + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted product
                    const index = trainers.findIndex(item => item.id === id);

                    // Delete the product
                    trainers.splice(index, 1);

                    // Update the trainers
                    this._trainers.next(trainers);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
}