import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Versions } from './versions';

describe('Versions', () => {
  let component: Versions;
  let fixture: ComponentFixture<Versions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Versions],
    }).compileComponents();

    fixture = TestBed.createComponent(Versions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
