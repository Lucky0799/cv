import { Component, OnInit, HostListener } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private socket: any;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | null;

  ngOnInit() {
    this.socket = io('http://localhost:3000'); // Connect to Node.js server
    this.canvas = document.getElementById('vncCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');

    this.socket.on('framebufferUpdate', (data: any) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + data.image;
      img.onload = () => {
        this.ctx?.drawImage(img, data.x, data.y, data.width, data.height);
      };
    });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.socket.emit('mouseMove', { x: event.offsetX, y: event.offsetY, buttonMask: 0 });
  }

  @HostListener('keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    this.socket.emit('keyPress', { keyCode: event.keyCode, isDown: true });
  }

  @HostListener('keyup', ['$event'])
  onKeyRelease(event: KeyboardEvent) {
    this.socket.emit('keyPress', { keyCode: event.keyCode, isDown: false });
  }
}