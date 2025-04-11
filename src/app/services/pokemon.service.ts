import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, ObservedValueOf, switchMap } from 'rxjs';
import { Pokemon } from '../model/pokemon.model';


@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  //conexion api
  listaPokemon(limit: number = 1025): Observable<Pokemon[]>{
      return this.http.get<any>(`${this.baseUrl}/pokemon?limit=${limit}`).pipe(
        map(response => response.results),
        switchMap((results: any[]) =>{
          const respuesta = results.map(p => this.pokemonPorNombre(p.name)); // con esto saco la información total aprovechando PokemonPorNombre
          return forkJoin(respuesta); //forkJoin es para que espere la informaci
        })
      );
  }


  // Observable para sacar los datos de un pokemon, Y Sergio ni me acuerdo de donde esta mi repositorio de la api de pokemon
  pokemonPorNombre(name:string):Observable<Pokemon>{
    return this.http.get<any>(`${this.baseUrl}/pokemon/${name}`).pipe(
      map(data=>({
        id:data.id,
        name: data.name,
        image:data.sprites?.front_default ,
        imageshiny:data.sprites?.front_shiny,
        height: data.height,
        weight: data.weight,
        types:data.types.map((t:any) => t.type.name), //increible //Mapa dentro de otro mapa :O
        stats: data.stats.map((s:any) =>({
          name:s.stat.name,
          value:s.base_stat
        }))


      }))
    );
  }

  //lista para conseguir una lista de pokemon por tipo
  listaPokemonTipo(valor: string): Observable<Pokemon[]> {
    return this.http.get<any>(`${this.baseUrl}/type/${valor}`).pipe(
      map(response => response.pokemon),
      switchMap((results: any[]) => {
        const respuesta = results.map(p => this.pokemonPorNombre(p.pokemon.name));
        return forkJoin(respuesta);

      })
    );
  }


  pokemonLegendarios(id:number) {
    return this.http.get<any>(`${this.baseUrl}/pokemon-species/${id}`);
  }







}
