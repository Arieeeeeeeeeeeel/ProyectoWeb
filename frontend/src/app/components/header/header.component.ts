import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:false,
})
export class HeaderComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}
  
  closeMenu() {
    const toggle = document.getElementById('menu-toggle') as HTMLInputElement;
    if (toggle && toggle.checked) {
      toggle.checked = false;
    }
  }
}
