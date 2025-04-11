import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../model/pokemon.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-informacion',
  imports: [CommonModule],
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.css'
})
export class InformacionComponent implements OnInit {
  pokemon!: Pokemon;
  shinyOn=false;

  constructor(private route: ActivatedRoute, private pokemonService: PokemonService) {}
  descripcion: string = '';
  altura: number = 0;
  peso: number = 0;

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.pokemonService.pokemonPorNombre(name).subscribe(poke => {
        this.pokemon = poke;
        this.altura = poke.height / 10;
        this.peso = poke.weight / 10;

        this.pokemonService.pokemonLegendarios(poke.id).subscribe(species => {
          const texto = species.flavor_text_entries.find(
            (entry: any) => entry.language.name === 'es'
          );
          this.descripcion = texto ? texto.flavor_text.replace(/\f/g, ' ') : 'Descripción no disponible';
        });
      });
    }
  }



  shiny(){

    this.shinyOn=!this.shinyOn
  }
}
