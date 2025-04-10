import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../model/pokemon.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-pokemon',
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.css']
})
export class PokemonComponent implements OnInit {
  listaPokemon: Pokemon[] = [];
  listaPrimera: Pokemon[] = [];
  listaTipos: Pokemon[] = [];
  listaOriginal: Pokemon[] = [];
  listaFiltrada: Pokemon[] = [];
  tiposActivos: string[] = [];



  buscador: string = ""; // para el ngModule
  tipoBusqueda=false;
  mostrarBrillantes = false;
  mostrarLegendarios = false;
  mostrarMitico= false;
  listaPokemonOriginal: Pokemon[] = [];
  arriba: string = '';

  constructor(private pokemonService: PokemonService) {}

  // Inicializa el componente
  ngOnInit(): void {
    this.listaPokemons();
    this.buscador = "";
    this.mostrarLegendarios = false;
    this.mostrarMitico = false;
  }

  // Función para mostrar los 151 Pokémon o los que haya
  listaPokemons() {
    this.pokemonService.listaPokemon(151).subscribe(pokemon => {
      // Filtra Pokémon con imagen válida
      const conImagen = this.filtrarConImagen(pokemon);

      // Guarda la lista original para reiniciar cuando haga falta
      this.listaOriginal = conImagen;
      this.listaFiltrada = [...this.listaOriginal];

      // Limpia cualquier estado previo
      this.arriba = "Todos";


      // Aplica los filtros activos si los hay (por ahora no, pero si usas reinicio o navegación futura sí)
      this.filtros();
      this.tiposDisponibles = new Set(Object.keys(this.tipoTraducido)); // Habilita todos los botones

    });
  }


  filtros() {
    let resultado = [...this.listaFiltrada];

    // Si hay filtro de legendarios/míticos, hacemos peticiones
    if (this.mostrarLegendarios || this.mostrarMitico) {
      const requests = resultado.map(p =>
        this.pokemonService.pokemonLegendarios(p.id).pipe(
          catchError(() => of(null))
        )
      );

      forkJoin(requests).subscribe(lista => {
        const filtrados = lista
          .map((data, index) => ({
            ok: this.mostrarLegendarios ? data?.is_legendary : data?.is_mythical,
            pokemon: resultado[index]
          }))
          .filter(item => item.ok)
          .map(item => item.pokemon);

        // ✅ Aquí aplicamos también la búsqueda
        let final = filtrados;

        if (this.buscador && this.buscador.trim() !== '') {
          const nombre = this.buscador.toLowerCase();
          final = final.filter(p =>
            this.tipoBusqueda
              ? p.name.toLowerCase().startsWith(nombre)
              : p.name.toLowerCase().includes(nombre)
          );
        }

        this.listaPokemon = final;
      });
    } else {
      // ✅ Si no hay legendarios/míticos, aplicamos directamente búsqueda
      if (this.buscador && this.buscador.trim() !== '') {
        const nombre = this.buscador.toLowerCase();
        resultado = resultado.filter(p =>
          this.tipoBusqueda
            ? p.name.toLowerCase().startsWith(nombre)
            : p.name.toLowerCase().includes(nombre)
        );
      }

      this.listaPokemon = resultado;
    }
  }





  // Función para buscar un Pokémon por nombre
  buscarPorNombre(valor: string) {
    this.buscador = valor.trim().toLowerCase();
    this.filtros();
  }





  tiposBusqueda(){
    this.tipoBusqueda=!this.tipoBusqueda
  }





  // Función para mostrar los SHINYYYYY!!!!
  Mostrarshiny() {
    this.mostrarBrillantes = !this.mostrarBrillantes;
  }

  // Función para filtrar Pokémon legendarios
  botonLegendario() {
    this.mostrarLegendarios = !this.mostrarLegendarios;

    if (this.mostrarLegendarios) {
      this.mostrarMitico = false; // No pueden estar ambos activos
    }

    this.filtros();
  }



  // Función para filtrar los Pokémon que no tienen imagen válida
  filtrarConImagen(lista: Pokemon[]): Pokemon[] {
    return lista.filter(pokemon =>
      pokemon.image && pokemon.image.trim() !== '' && !pokemon.image.includes('undefined')
    );
  }

  //misma funcion que el botonLegendario
  pokemonMitico() {
    this.mostrarMitico = !this.mostrarMitico;

    if (this.mostrarMitico) {
      this.mostrarLegendarios = false; // No pueden estar ambos activos
    }

    this.filtros();
  }




  tiposDisponibles: Set<string> = new Set();

  botonesTipos(tipo: string) {
    const index = this.tiposActivos.indexOf(tipo);

    // Alternar selección del tipo
    if (index >= 0) {
      this.tiposActivos.splice(index, 1);
    } else if (this.tiposActivos.length < 2) {
      this.tiposActivos.push(tipo);
    }

    // Si no hay tipos activos, mostrar todos
    if (this.tiposActivos.length === 0) {
      this.tiposDisponibles = new Set(Object.keys(this.tipoTraducido));
      this.listaFiltrada = [...this.listaOriginal];
      this.arriba = "Todos";
      this.filtros();
      return;
    }

    // Si hay solo un tipo activo, buscar tipos compatibles con él
    if (this.tiposActivos.length === 1) {
      const tipoSeleccionado = this.tiposActivos[0];

      this.pokemonService.listaPokemonTipo(tipoSeleccionado).subscribe(pokemonPorTipo => {
        const conImagen = this.filtrarConImagen(pokemonPorTipo);

        // Extraer tipos compatibles (excluyendo el propio tipo seleccionado)
        const tiposCompatibles = new Set<string>();
        conImagen.forEach(poke => {
          poke.types.forEach(t => {
            if (t !== tipoSeleccionado) {
              tiposCompatibles.add(t);
            }
          });
        });

        tiposCompatibles.add(tipoSeleccionado);
        this.tiposDisponibles = tiposCompatibles;
                this.listaFiltrada = conImagen;
        this.arriba = `${this.tipoTraducido[tipoSeleccionado]}`;
        this.filtros();
      });

      return;
    }

    // Si hay dos tipos activos, buscar la intersección
    const peticiones = this.tiposActivos.map(tipoActivo =>
      this.pokemonService.listaPokemonTipo(tipoActivo).pipe(
        catchError(() => of([])) // Por si alguna llamada falla
      )
    );

    forkJoin(peticiones).subscribe((respuestas: Pokemon[][]) => {
      const interseccion = respuestas.reduce((a, b) =>
        a.filter(pokeA => b.some(pokeB => pokeB.id === pokeA.id))
      );

      this.listaFiltrada = this.filtrarConImagen(interseccion);
      this.arriba = this.tiposActivos
        .map(tipo => this.tipoTraducido[tipo] || tipo)
        .join(' + ');

      // Solo permitir seguir mostrando los tipos activos
      this.tiposDisponibles = new Set(this.tiposActivos);
      this.filtros();
    });
  }









  // Traducciones de tipos
  tipoTraducido: { [key: string]: string } = {
    grass: 'Planta',
    fire: 'Fuego',
    water: 'Agua',
    bug: 'Bicho',
    normal: 'Normal',
    flying: 'Aire',
    poison: 'Veneno',
    electric: 'Eléctrico',
    ground: 'Tierra',
    fairy: 'Hada',
    fighting: 'Lucha',
    psychic: 'Psíquico',
    rock: 'Roca',
    ice: 'Hielo',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero'
  };

  // Traducciones de estadísticas
  statTraducida: { [key: string]: string } = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Esp',
    'special-defense': 'Defensa Esp',
    speed: 'Velocidad'
  };


}
