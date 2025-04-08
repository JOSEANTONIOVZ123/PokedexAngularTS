import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../model/pokemon.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon',
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.css'
})
export class PokemonComponent implements OnInit {
  listaPokemon: Pokemon[] = [];
  buscador: string=""; // para el ngModule
  constructor(private pokemonService: PokemonService) {}

  //para inicializarlo nada mas empezar
  ngOnInit(): void {
    this.listaPokemons();
  }

  //funcion para mostrar los 151 pokemons o los que haya
  listaPokemons() {
    this.pokemonService.listaPokemon(151).subscribe(pokemon => {
      console.log(pokemon);
      this.listaPokemon = pokemon;
    });
  }


  //funcion para cuando le llegue un registro busque un pokemon por nombre
  buscarPorNombre(valor:string){
    //primero evitamos las mayusculas y los espacios
    const nombre = valor.trim().toLowerCase();
    //si no devuelve nada no escribe nada
    if (!nombre) return;
    //con este if evito que escriba varias veces el mismo pokemon sin razon
    if (nombre === this.listaPokemon[0].name) {
      return;
    }
    //con esto saco un pokemon por su nombre y todas sus estadisticas
    this.pokemonService.pokemonPorNombre(nombre).subscribe({
      next: (pokemon: Pokemon) => {
        this.listaPokemon = [pokemon];
      }
    });
  }


  //funcion botones por tipos
  botonesTipos(valor:string){
    this.pokemonService.listaPokemonTipo(valor).subscribe(pokemon =>{
      console.log(pokemon)
      this.listaPokemon = pokemon
    });

  }

  //TODO: Boton brillante
  // hecho pero es cutrisimo
  botonBrillante(){
    this.pokemonService.listaPokemon2(151).subscribe(pokemon => {
      console.log(pokemon);
      this.listaPokemon = pokemon;
    });
  }

  //TODO:Boton legendarios
    botonInutil(valor:string){
      this.pokemonService.pokemonPorNombre(valor).subscribe({
        next: (pokemon: Pokemon) => {
          this.listaPokemon = [pokemon];
        }
      });
    }



}
