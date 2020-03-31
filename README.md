# BiblioTjs

Uma ferramenta escrita em Node para registrar e controlar midias físicas como: livros, CDs, fitas VHS entre outras. Está organizado, também, para realizar um registro simples de empréstimo a terceiros, sem cadastro desses usuários.

## Instalação
As orientações a seguir partem do pressusposto que o usuário já possui o Node e o NMP instalados em sua máquina. Após clonar o aplicativo será necessário realizar algumas configurações:

## Instalar as dependências.
Acesse o diretório raíz do aplicativo e execute:
`nmp install`


## Executar aplicativo
Acesse a raíz do aplicativo e execute:
`node index.js`

A plataforma estará acessível em **http://[IP_DA_MAQUINA_NA_REDE]:3000/**.

## Executando o aplicativo em um Smartphone

Os aplicativos Node podem ser facilmente executados em um Smartphone. Testado apenas em sistemas Android...

### Instale o **Termux**
Baixe-o na loja de aplicativos Google Play ou similar.

### Instale o None dentro do Termux
Abra o aplicativo e execute o comando:
`apt install nodejs`

### Para instalar o BiblioTjs siga os passos da instalação, descrito anteriormente

### Acesso ao programa
Conecte o telefone na rede WiFi ou configure-o como ponto de acesso. Abra o Termux e execute:
`node index.js`

O programa estará acessível em **http://[IP_DO_TELEFONE]:3000/**.
