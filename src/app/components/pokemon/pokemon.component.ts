import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../model/pokemon.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, tap } from 'rxjs';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.css']
})
export class PokemonComponent implements OnInit {
  listaPrimera: Pokemon[] =[]; //Lista para guardar los 1025 pokemon en Todos.
  listaPokemon: Pokemon[] = []; //lista principal donde se escribira Todo en el html.
  listaOriginal: Pokemon[] = []; //listaOriginal sirve como array de apoyo a la hora de recibir varios datos y así no perder informacion si se mueve uno mucho hacia delante y hacia atras.
  listaFiltrada: Pokemon[] = []; //Una lista donde despues de todos los filtros este se convierta en la listaPokemon
  tiposActivos: string[] = []; //array de pokemons para los tipos pokemon activos

  buscador: string = ''; // para coger el string de busqueda del httml
  tipoBusqueda = false; // para cambiar entre tipos de busqueda
  mostrarBrillantes = false; //para cambiar entre shiny o no.
  mostrarLegendarios = false; // para cambiar entre legendarios o no
  mostrarMitico = false; // para cambiar entre mitico o no
  arriba: string = ''; // arriba es basicamente un nombre para que cada vez que se busque un tipo este se muestre en httml

   //un set para poder hacer posible la busqueda por dos tipos
  tiposDisponibles: Set<string> = new Set(); //aparte sirve para poder desactivar los botones si estos no estan disponibles

  //cacheTipos es para evitar que se haga mas de una peticion a la api
  private cacheTipos: Map<string, Pokemon[]> = new Map(); //aunque con la funcion filtros() esto no aplica y debo cambiarlo.

  //constructor :p
  constructor(private pokemonService: PokemonService, private router: Router) {}

  //para inicializar desde el inicio la listaPokemon y este se guarde en
  ngOnInit(): void {
    this.listaPokemons(); //inicializamos listaPokemon nada mas aunque no es necesario.
  }

  //Para escribir la lista de pokemons original y el if es para que si ya esta guardada
  //en listaPrimera pues este no hace ninguna peticion.
  listaPokemons() {
    //Primera peticion si no contiene nada la primera lista
    if (this.listaPrimera.length === 0) {
      this.pokemonService.listaPokemon(151).subscribe(pokemon => {
        const conImagen = this.filtrarConImagen(pokemon);
        this.listaOriginal = conImagen;
        this.listaFiltrada = [...this.listaOriginal];
        this.arriba = 'Todos';
        this.filtros(); //Filtra por legendarios o miticos
        this.tiposDisponibles = new Set(Object.keys(this.tipoTraducido));
    });
    //si ya hay datos pues se pone y listo y ya se le puede hacer los filtros oportunos
    }else{
        this.listaOriginal = this.listaPrimera;
        this.listaFiltrada = [...this.listaOriginal];
        this.arriba = 'Todos';
        this.filtros(); //Filtra por legendarios o miticos
        this.tiposDisponibles = new Set(Object.keys(this.tipoTraducido));
    }

  }

  //Otra funcion dificil de explicar.
  //Basicamente esta funcion hace un pipe a pokemonLegendarios que esta en service y este filtra depende si cada pokemon
  //contiene ok en el mapa es decir si es legendario o mitico y si es así este se aplica a la listaFiltrada.
  filtros() {
    let resultado = [...this.listaFiltrada]; //creamos un resultado

    if (this.mostrarLegendarios || this.mostrarMitico) { //si uno de los dos esta activo empieza la busqueda sino hace la busqueda en else
      const requests = resultado.map(p =>
        this.pokemonService.pokemonLegendarios(p.id).pipe( //sacamos todos los pokemons por su id el cual es importante por id porque hay pokemons de /pokemon-species que no son iguales de /pokemon
          catchError(() => of(null)) //pillamos si hay un error
        )
      );
      //Bendito forkJoin gracias a esto se logra todo esto.
      forkJoin(requests).subscribe(lista => {
        const filtrados = lista //creamos una listita
          .map((data, index) => ({
            ok: this.mostrarLegendarios ? data?.is_legendary : data?.is_mythical, // si legendarios contiene estos dos valores entonces es ok y sigue, sino da error aunque debería controlar ese error, ya funciona
            pokemon: resultado[index]
          }))
          .filter(p => p.ok) // se filtra si el p es oki doki
          .map(p => p.pokemon);
          //importante esto hace que tambien commpruebe si el buscador esta buscando
        this.listaPokemon = this.aplicarBusqueda(filtrados);
      });
    } else {
       //importante esto hace que tambien commpruebe si el buscador esta buscando
      this.listaPokemon = this.aplicarBusqueda(resultado);
    } //finalmente explicado
  }

  //función para buscar pokemon
  aplicarBusqueda(lista: Pokemon[]): Pokemon[] {
    if (!this.buscador.trim()) return lista;
    const nombre = this.buscador.toLowerCase(); //importante que este en minusculas
    return lista.filter(p =>
      this.tipoBusqueda
        ? p.name.toLowerCase().startsWith(nombre)  //Podría haber hecho un if pero sinceramente me parece mas pulcro de esta manera.
        : p.name.toLowerCase().includes(nombre)
    );
  }

  //Pues buscar por nombre usando otra vez los filtros (incluye si legendarios o miticos esta activo)
  buscarPorNombre(valor: string) {
    this.buscador = valor.trim().toLowerCase(); // para poner datos en buscador y asi aplica la busqueda
    this.filtros();
  }

  //basicamente para que un checkbox cambie y tenga funcionalidad
  tiposBusqueda() {
    this.tipoBusqueda = !this.tipoBusqueda;
  }

  //sencillamente cambia el sprite normal por el shiny :O
  Mostrarshiny() {
    this.mostrarBrillantes = !this.mostrarBrillantes;
  }

  //Muestra pokemons Legendarios usando la funcion filtros().
  botonLegendario() {
    this.mostrarLegendarios = !this.mostrarLegendarios;
    if (this.mostrarLegendarios) this.mostrarMitico = false;
    this.filtros();
  }

  //Muestra pokemons Miticos usando la funcion filtros().
  pokemonMitico() {
    this.mostrarMitico = !this.mostrarMitico;
    if (this.mostrarMitico) this.mostrarLegendarios = false;
    this.filtros();
  }

  //como bien dice, filtra la lista de pokemons si esta no contiene ningun tipo de imagen
  filtrarConImagen(lista: Pokemon[]): Pokemon[] {
    return lista.filter(pokemon =>
      pokemon.image && pokemon.image.trim() !== '' && !pokemon.image.includes('undefined')
    );
  }

  //esto es una tortura de explicar.... Lo comentaré mas tarde:
  //botonesTipos consiste en una lista de pokemons independiente a listaPokemons debido a /pokemon-species en vez de /pokemon
  botonesTipos(tipo: string) {
    // Primero reviso si el tipo que el usuario hizo clic ya está seleccionado
    const index = this.tiposActivos.indexOf(tipo);
    if (index >= 0) {
      // Si ya estaba, lo quito
      this.tiposActivos.splice(index, 1);
    } else if (this.tiposActivos.length < 2) {
      // Si no estaba y todavía no hay 2 tipos seleccionados, lo agrego
      this.tiposActivos.push(tipo);
    }

    // Si ya no hay tipos seleccionados, muestro todos los Pokémon
    if (this.tiposActivos.length === 0) {
      // Vuelvo a activar todos los tipos como disponibles
      this.tiposDisponibles = new Set(Object.keys(this.tipoTraducido));
      // Vuelvo a mostrar la lista original sin filtros
      this.listaFiltrada = [...this.listaOriginal];
      // Cambio el texto de arriba para que diga "Todos"
      this.arriba = 'Todos';
      // Aplico los demás filtros (como legendarios, brillantes, etc.)
      this.filtros();
      return;
    }

    // Si solo hay un tipo seleccionado
    if (this.tiposActivos.length === 1) {
      const tipoSeleccionado = this.tiposActivos[0];
      // Reviso si ya había guardado los Pokémon de este tipo antes (caché)
      const cache = this.cacheTipos.get(tipoSeleccionado);

      if (cache) {
        // Si ya lo tenía guardado, lo uso directamente
        const conImagen = this.filtrarConImagen(cache);
        this.aplicarFiltroTipoUnico(tipoSeleccionado, conImagen); // usamos el filtro unico
      } else {
        // Si no lo tenía, hago la petición al servicio
        this.pokemonService.listaPokemonTipo(tipoSeleccionado).subscribe(pokemonPorTipo => {
          // Guardo los datos para no tener que pedirlos otra vez
          this.cacheTipos.set(tipoSeleccionado, pokemonPorTipo);
          const conImagen = this.filtrarConImagen(pokemonPorTipo);
          this.aplicarFiltroTipoUnico(tipoSeleccionado, conImagen); //usamos el filtro unico
        });
      }
      return;
    }

    // Si hay dos tipos seleccionados, tengo que hacer dos peticiones
    const peticiones = this.tiposActivos.map(tipoActivo => {
      const cache = this.cacheTipos.get(tipoActivo);
      if (cache) return of(cache); // Si ya lo tenía, lo uso
      return this.pokemonService.listaPokemonTipo(tipoActivo).pipe(
        tap(data => this.cacheTipos.set(tipoActivo, data)), // Guardo lo que me llega
        catchError(() => of([])) // Si falla la petición, mando un array vacío
      );
    });

    // forkJoin espera que terminen todas las peticiones para seguir
    forkJoin(peticiones).subscribe((respuestas: Pokemon[][]) => {
      // Busco los Pokémon que estén en ambas respuestas (intersección)
      const interseccion = respuestas.reduce((a, b) =>
        a.filter(pokeA => b.some(pokeB => pokeB.id === pokeA.id))
      );

      // Aplico filtro de que tengan imagen
      const filtrados = this.filtrarConImagen(interseccion);
      // Actualizo la lista para mostrar solo los que cumplen
      this.listaFiltrada = filtrados;
      // Pongo el texto de arriba con los tipos seleccionados
      this.arriba = this.tiposActivos.map(tipo => this.tipoTraducido[tipo] || tipo).join(' + ');
      // Solo muestro como disponibles los tipos seleccionados
      this.tiposDisponibles = new Set(this.tiposActivos);
      // Aplico los demás filtros
      this.filtros();
    });
  }


  //filtrar solo por un tipo
  private aplicarFiltroTipoUnico(tipoSeleccionado: string, conImagen: Pokemon[]) {
    // Creo un Set para guardar los tipos compatibles (sin repetir)
    const tiposCompatibles = new Set<string>();

    // Recorro cada Pokémon filtrado (que ya tienen imagen)
    conImagen.forEach(poke => {
      // Reviso los tipos del Pokémon
      poke.types.forEach(t => {
        // Si el tipo no es el que seleccionamos, lo agrego al set
        if (t !== tipoSeleccionado) tiposCompatibles.add(t);
      });
    });

    // Al final también agrego el tipo que está seleccionado
    tiposCompatibles.add(tipoSeleccionado);

    // Actualizo los tipos disponibles con los que encontré arriba
    this.tiposDisponibles = tiposCompatibles;

    // Guardo la lista final que se va a mostrar en pantalla
    this.listaFiltrada = conImagen;

    // Actualizo el texto de arriba con el nombre traducido del tipo
    this.arriba = `${this.tipoTraducido[tipoSeleccionado]}`;

    // Aplico los demás filtros (como brillantes, legendarios, nombre, etc.)
    this.filtros();
  }



//para poner los iconos de los pokemons
  getIconoTipo(tipo: string): string {
    return `https://www.serebii.net/pokedex-bw/type/${tipo}.gif`;
  }


  //Como soy un maldito flipado de pokemon he decidido hacer una traducción hecha a mano en español
  //no me juzguen me encanta pokemon
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
  //lo mismo que en tipoTraducido
  statTraducida: { [key: string]: string } = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Esp',
    'special-defense': 'Defensa Esp',
    speed: 'Velocidad'
  };


  verDetalle(name: string) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/informacion', name])
    );
    window.open(url, '_blank');
  }

}
