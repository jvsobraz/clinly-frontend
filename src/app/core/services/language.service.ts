import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'pt-BR' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  private readonly STORAGE_KEY = 'clinly_lang';
  readonly supported: AppLang[] = ['pt-BR', 'en'];

  get current(): AppLang {
    return (localStorage.getItem(this.STORAGE_KEY) as AppLang) ?? 'pt-BR';
  }

  init() {
    this.translate.addLangs(this.supported);
    this.translate.setDefaultLang('pt-BR');
    this.translate.use(this.current);
  }

  use(lang: AppLang) {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.translate.use(lang);
  }

  toggle() {
    this.use(this.current === 'pt-BR' ? 'en' : 'pt-BR');
  }

  label(lang: AppLang): string {
    return lang === 'pt-BR' ? 'PT' : 'EN';
  }
}
