# Szybki start

**Języki:** [English (Angielski)](QUICKSTART.md) | [Polski](#)

Uruchom swój serwer MCP dla inFakt w 5 minut!

## Krok 1: Uzyskaj klucz API

### Opcja A: Produkcja (Prawdziwe konto)
1. Przejdź na https://app.infakt.pl
2. Zaloguj się lub utwórz konto
3. Przejdź do **Ustawienia** → **Inne opcje** → **API**
4. Kliknij **Generuj nowy klucz API**
5. Wybierz wymagane uprawnienia:
   - ✅ `api:invoices:read` - Odczyt faktur, klientów, produktów
   - ✅ `api:invoices:write` - Tworzenie/aktualizacja faktur
   - ✅ `api:costs:read` - Odczyt kosztów (opcjonalnie)
   - ✅ `api:costs:write` - Zarządzanie kosztami (opcjonalnie)
6. Skopiuj swój klucz API

### Opcja B: Sandbox (Tylko testy)
1. Zarejestruj się na https://konto.sandbox-infakt.pl/rejestracja
2. Przejdź do **Ustawienia** → **API**
3. Wygeneruj klucz API ze wszystkimi uprawnieniami
4. Skopiuj swój klucz API

## Krok 2: Instalacja zależności

```bash
cd infakt-mcp
npm install
npm run build
```

## Krok 3: Konfiguracja środowiska

Utwórz plik `.env`:

```bash
# Dla produkcji
INFAKT_API_KEY=twoj_produkcyjny_klucz_api
INFAKT_USE_SANDBOX=false

# LUB dla testów w sandbox
INFAKT_API_KEY=twoj_klucz_sandbox
INFAKT_USE_SANDBOX=true
```

## Krok 4: Dodaj do Claude Desktop

### macOS
Edytuj `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "infakt": {
      "command": "node",
      "args": ["/absolutna/sciezka/do/infakt-mcp/dist/index.js"],
      "env": {
        "INFAKT_API_KEY": "twoj_klucz_api",
        "INFAKT_USE_SANDBOX": "false"
      }
    }
  }
}
```

### Windows
Edytuj `%APPDATA%\Claude\claude_desktop_config.json` z taką samą konfiguracją.

**Ważne:** Zamień `/absolutna/sciezka/do/infakt-mcp` na rzeczywistą pełną ścieżkę!

## Krok 5: Zrestartuj Claude Desktop

Zamknij i uruchom ponownie Claude Desktop całkowicie.

## Krok 6: Przetestuj!

Wypróbuj te polecenia w Claude:

### Test 1: Lista faktur
```
Pokaż moje ostatnie 5 faktur
```

### Test 2: Informacje o koncie
```
Pokaż informacje o moim koncie inFakt
```

### Test 3: Lista klientów
```
Pokaż wszystkich moich klientów
```

### Test 4: Tworzenie faktury (Tylko Sandbox!)
```
Utwórz testową fakturę dla "Test Client Sp. z o.o." z:
- Jedną usługą: "Konsultacje" za 1000 PLN netto z VAT 23%
- Metodą płatności: przelew
- NIP klienta: 1234567890
- Adres klienta: ul. Testowa 1, 00-001 Warszawa
```

## Rozwiązywanie problemów

### "Serwer MCP niedostępny"
- Sprawdź czy ścieżka w konfiguracji jest absolutna (nie względna)
- Sprawdź czy budowanie się powiodło: `ls dist/index.js`
- Zrestartuj Claude Desktop całkowicie

### "Uwierzytelnianie nieudane"
- Sprawdź czy klucz API jest poprawny
- Sprawdź czy nie wygasł
- Upewnij się że uprawnienia zawierają przynajmniej `api:invoices:read`

### "Nie można znaleźć modułu"
- Uruchom `npm install` ponownie
- Uruchom `npm run build` ponownie
- Sprawdź czy folder `node_modules` istnieje

### Nadal masz problemy?
1. Sprawdź logi: Zobacz konsolę deweloperską Claude Desktop
2. Przetestuj ręcznie:
   ```bash
   INFAKT_API_KEY=twoj_klucz npm run dev
   ```
3. Sprawdź czy klucz API działa z curl:
   ```bash
   curl -H "X-inFakt-ApiKey: TWOJ_KLUCZ" \
        https://api.infakt.pl/api/v3/account.json
   ```

## Co dalej?

### Poznaj narzędzia
Zobacz wszystkie dostępne narzędzia w [README.pl.md](README.pl.md#dostępne-narzędzia).

### Typowe przypadki użycia

#### Przepływ pracy z fakturami
1. Lista klientów → `infakt_list_clients`
2. Utwórz fakturę → `infakt_create_invoice`
3. Sprawdź status → `infakt_check_invoice_status`
4. Pobierz PDF → `infakt_download_invoice_pdf`
5. Wyślij e-mail → `infakt_send_invoice_email`
6. Oznacz jako opłaconą → `infakt_mark_invoice_paid`

#### Zarządzanie klientami
1. Lista wszystkich klientów → `infakt_list_clients`
2. Szukaj po NIP → `infakt_list_clients` z filtrem `nip`
3. Pobierz szczegóły → `infakt_get_client`
4. Aktualizuj informacje → `infakt_update_client`

#### Katalog produktów
1. Lista produktów → `infakt_list_products`
2. Szukaj po nazwie → `infakt_list_products` z filtrem `name`
3. Dodaj nowy produkt → `infakt_create_product`
4. Aktualizuj cenę → `infakt_update_product`

### Zaawansowane funkcje

#### Filtrowanie
```
Pokaż faktury z grudnia 2024 które są nieopłacone
```

#### Sortowanie
```
Pokaż produkty posortowane po cenie malejąco
```

#### Wybór pól
```
Pokaż tylko numery faktur i sumy z ostatniego miesiąca
```

## Wsparcie

- **Dokumentacja API**: https://www.infakt.pl/api/
- **Wsparcie inFakt**: pomoc@infakt.pl
- **Problemy GitHub**: [Zgłoś problem](https://github.com/yourusername/infakt-mcp/issues)

## Wskazówki

1. **Najpierw Sandbox**: Zawsze testuj w sandbox przed użyciem produkcji
2. **Sprawdzaj status**: Przy tworzeniu faktur zawsze sprawdzaj status
3. **Limity**: Pamiętaj o limitach API (300 GET/min, 150 innych/min)
4. **Cache'uj dane**: Rozważ cache'owanie list klientów i produktów
5. **Obsługa błędów**: Sprawdzaj komunikaty błędów dla pomocnych informacji debugowania

Miłego fakturowania! 🧾
