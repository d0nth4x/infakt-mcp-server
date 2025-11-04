# Serwer MCP dla inFakt

**Języki:** [English (Angielski)](README.md) | [Polski](#)

Serwer Model Context Protocol (MCP) dla API inFakt - kompleksowej polskiej usługi fakturowania i księgowości.

## Przegląd

Ten serwer MCP zapewnia bezproblemową integrację z API REST inFakt, umożliwiając asystentom AI takim jak Claude interakcję z Twoim kontem inFakt w zakresie:

- **Zarządzanie fakturami** - Tworzenie, odczyt, aktualizacja i usuwanie faktur VAT, faktur korygujących i innych rodzajów dokumentów
- **Zarządzanie klientami** - Zarządzanie bazą klientów
- **Zarządzanie produktami** - Utrzymywanie katalogu produktów/usług
- **Śledzenie kosztów** - Dostęp do dokumentów kosztowych
- **Dane referencyjne** - Pobieranie stawek VAT, kont bankowych i innych danych konfiguracyjnych

## Funkcje

- Pełne operacje CRUD dla faktur, klientów i produktów
- Asynchroniczne tworzenie faktur z śledzeniem statusu
- Generowanie PDF i wysyłka e-mail
- Zaawansowane filtrowanie, paginacja i sortowanie
- Wsparcie dla środowisk produkcyjnego i testowego (sandbox)
- Kompleksowa obsługa błędów

## Wymagania

- Node.js 18 lub nowszy
- Konto inFakt (produkcyjne lub sandbox)
- Klucz API inFakt

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone <repository-url>
cd infakt-mcp
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Zbuduj projekt:

```bash
npm run build
```

## Konfiguracja

### Uzyskiwanie klucza API

#### Środowisko produkcyjne:

1. Zaloguj się do [inFakt](https://app.infakt.pl)
2. Przejdź do Ustawienia → Inne opcje → API
3. Wygeneruj nowy klucz API z wymaganymi uprawnieniami

#### Środowisko testowe (Sandbox):

1. Zarejestruj się na [inFakt Sandbox](https://konto.sandbox-infakt.pl/rejestracja)
2. Przejdź do Ustawienia → API
3. Wygeneruj testowy klucz API

### Zmienne środowiskowe

Utwórz plik `.env` lub ustaw następujące zmienne środowiskowe:

```bash
# Wymagane
INFAKT_API_KEY=twoj_klucz_api

# Opcjonalne
INFAKT_USE_SANDBOX=true  # Ustaw na 'true' dla sandbox, pomiń lub 'false' dla produkcji
INFAKT_BASE_URL=https://api.infakt.pl/api/v3  # Niestandardowy URL bazowy (opcjonalnie)
```

### Konfiguracja klienta MCP

#### Dla Claude Desktop:

Dodaj do pliku `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

#### Dla innych klientów MCP:

Skonfiguruj zgodnie z dokumentacją swojego klienta, upewniając się że:
- Komenda: `node dist/index.js`
- Zmienne środowiskowe są poprawnie ustawione
- Katalog roboczy jest ustawiony na root projektu

## Dostępne narzędzia

### Zarządzanie fakturami

#### `infakt_create_invoice`
Utwórz nową fakturę VAT asynchronicznie.

**Parametry:**
- `client_company_name` (wymagane): Nazwa firmy klienta
- `payment_method` (wymagane): cash, transfer, card, itp.
- `services` (wymagane): Tablica usług/produktów
- `status`: draft (domyślnie), paid lub printed
- `client_id`: Użyj istniejącego klienta
- Dane klienta dla nowych klientów (first_name, last_name, tax_code, itp.)
- Dodatkowe pola: notes, invoice_date, sale_date, payment_date, itp.

**Zwraca:** Numer referencyjny zadania do sprawdzenia statusu

#### `infakt_check_invoice_status`
Sprawdź status asynchronicznie tworzonej faktury.

**Parametry:**
- `task_reference_number` (wymagane): Numer referencyjny z create_invoice

#### `infakt_list_invoices`
Wyświetl wszystkie faktury z filtrowaniem i paginacją.

**Parametry:**
- `offset`: Offset paginacji
- `limit`: Wyniki na stronę (max 100)
- `order`: Kolejność sortowania (np. "invoice_date desc")
- `number`: Filtruj po numerze faktury
- `client_company_name`: Filtruj po nazwie klienta
- `status`: Filtruj po statusie
- `invoice_date_from`, `invoice_date_to`: Filtry zakresu dat
- `fields`: Pola do zwrócenia oddzielone przecinkami

#### `infakt_get_invoice`
Pobierz szczegółowe informacje o konkretnej fakturze.

**Parametry:**
- `invoice_uuid` (wymagane): UUID faktury
- `fields`: Opcjonalny wybór pól

#### `infakt_update_invoice`
Zaktualizuj istniejącą fakturę (tylko szkic).

**Parametry:**
- `invoice_uuid` (wymagane): UUID faktury
- Pola do aktualizacji (client_company_name, payment_method, services, itp.)

#### `infakt_delete_invoice`
Usuń fakturę (tylko szkic).

**Parametry:**
- `invoice_uuid` (wymagane): UUID faktury

#### `infakt_download_invoice_pdf`
Pobierz fakturę jako PDF (zakodowany base64).

**Parametry:**
- `invoice_uuid` (wymagane): UUID faktury
- `document_type`: original, copy, duplicate, itp.
- `locale`: pl, en lub pe

#### `infakt_send_invoice_email`
Wyślij fakturę przez e-mail.

**Parametry:**
- `invoice_uuid` (wymagane): UUID faktury
- `recipient_email`: Niestandardowy odbiorca (domyślnie używa e-maila klienta)
- `email_subject`: Niestandardowy temat
- `email_message`: Niestandardowa wiadomość

#### `infakt_mark_invoice_paid`
Oznacz fakturę jako opłaconą.

**Parametry:**
- `invoice_uuid` (wymagane): UUID faktury
- `paid_date` (wymagane): Data płatności (RRRR-MM-DD)

### Zarządzanie klientami

#### `infakt_list_clients`
Wyświetl wszystkich klientów z filtrowaniem.

#### `infakt_get_client`
Pobierz szczegóły klienta po ID.

#### `infakt_create_client`
Utwórz nowego klienta.

#### `infakt_update_client`
Zaktualizuj istniejącego klienta.

#### `infakt_delete_client`
Usuń klienta.

### Zarządzanie produktami

#### `infakt_list_products`
Wyświetl wszystkie produkty z filtrowaniem.

#### `infakt_get_product`
Pobierz szczegóły produktu po ID.

#### `infakt_create_product`
Utwórz nowy produkt.

#### `infakt_update_product`
Zaktualizuj istniejący produkt.

#### `infakt_delete_product`
Usuń produkt.

### Dane referencyjne

#### `infakt_get_vat_rates`
Pobierz dostępne stawki VAT.

#### `infakt_get_bank_accounts`
Pobierz skonfigurowane konta bankowe.

#### `infakt_get_account_info`
Pobierz informacje o koncie i limity.

### Zarządzanie kosztami

#### `infakt_list_costs`
Wyświetl dokumenty kosztowe.

#### `infakt_get_cost`
Pobierz szczegóły dokumentu kosztowego.

## Przykłady użycia

### Przykład 1: Tworzenie faktury

```
Utwórz nową fakturę dla klienta "ACME Corp" z:
- Metodą płatności: przelew
- Jedną usługą: "Tworzenie strony WWW" za 5000 PLN netto z VAT 23%
- NIP klienta: 1234567890
- Adres klienta: ul. Główna 1, 00-001 Warszawa, Polska
```

Serwer MCP:
1. Utworzy fakturę asynchronicznie
2. Zwróci numer referencyjny zadania
3. Możesz następnie sprawdzić status i pobrać UUID faktury

### Przykład 2: Lista ostatnich faktur

```
Wyświetl ostatnie 10 faktur z grudnia 2024, posortowane po dacie malejąco
```

### Przykład 3: Wysyłka faktury e-mailem

```
Wyślij fakturę <uuid> przez e-mail do klienta
```

### Przykład 4: Generowanie PDF

```
Pobierz PDF dla faktury <uuid> w języku polskim
```

## Wymagane uprawnienia API

Klucz API musi posiadać odpowiednie uprawnienia dla operacji, które chcesz wykonywać:

- `api:invoices:read` - Odczyt faktur, klientów, produktów
- `api:invoices:write` - Tworzenie/aktualizacja/usuwanie faktur, klientów, produktów
- `api:costs:read` - Odczyt dokumentów kosztowych
- `api:costs:write` - Zarządzanie kosztami
- `api:accounting:read` - Odczyt danych księgowych
- `api:accounting:write` - Zarządzanie operacjami księgowymi
- `api:sensitive:bank_accounts:write` - Zarządzanie kontami bankowymi

## Limity

API inFakt ma następujące limity:
- Żądania GET: 300 żądań na 60 sekund na IP
- Inne metody: 150 żądań na 60 sekund na IP
- Wysyłka faktur e-mailem: 3000/dzień (konta płatne), 20/dzień (konta darmowe)

## Rozwój

### Uruchomienie w trybie deweloperskim

```bash
npm run dev
```

### Budowanie

```bash
npm run build
```

### Tryb nasłuchiwania

```bash
npm run watch
```

## Testowanie

### Używanie środowiska Sandbox

Ustaw `INFAKT_USE_SANDBOX=true` aby użyć środowiska testowego:
- Nie tworzy prawdziwych faktur
- Bezpieczne do testowania integracji
- Limit: 2500 faktur miesięcznie

## Rozwiązywanie problemów

### Błędy uwierzytelniania (401)
- Sprawdź czy klucz API jest poprawny
- Upewnij się że klucz ma wymagane uprawnienia
- Sprawdź czy klucz nie wygasł

### Wymagana płatność (402)
- Twój plan nie obsługuje dostępu do API lub przekroczyłeś limit dokumentów
- Zmień plan na [inFakt](https://app.infakt.pl)

### Błędy limitu żądań (429)
- Poczekaj przed ponowną próbą
- Zaimplementuj exponential backoff
- Rozważ cache'owanie odpowiedzi

### Błędy walidacji (422)
- Sprawdź czy wszystkie wymagane pola są podane
- Zweryfikuj formaty danych (daty jako RRRR-MM-DD, prawidłowe stawki VAT, itp.)
- Przejrzyj komunikaty błędów w odpowiedzi

## Zasoby

- [Dokumentacja API inFakt](https://www.infakt.pl/api/)
- [Strona inFakt](https://www.infakt.pl)
- [Dokumentacja Model Context Protocol](https://modelcontextprotocol.io)
- [Specyfikacja MCP](https://spec.modelcontextprotocol.io)

## Licencja

MIT

## Wsparcie

W sprawie problemów z API skontaktuj się z pomocą inFakt: [pomoc@infakt.pl](mailto:pomoc@infakt.pl)

W sprawie problemów z serwerem MCP, zgłoś problem w tym repozytorium.
