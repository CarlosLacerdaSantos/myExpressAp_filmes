# 🎥 Cinetop - Seu Guia Inteligente de Filmes

[![Licença MIT](https://img.shields.io/badge/Licença-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Versão 1.0](https://img.shields.io/badge/Versão-1.0-blue.svg)

**Descubra onde assistir seus filmes favoritos** - Uma aplicação web que combina dados em tempo real da API do TMDB com uma interface intuitiva para ajudar você a encontrar filmes e plataformas de streaming. veja aqui :   <div> <a href="https://cinetop.onrender.com" target="_blank">Cinetop</a></div>



![Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3Z2d3FpOG1qb2xwZ3hjbGZ0a2V4a2QxZXVqM3hqYzN4Z2d6dDR6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3orieS4jfHJaKwkeli/giphy.gif)

## ✨ Funcionalidades Incríveis

- 🎬 **Listagem Dinâmica de Filmes**  
  Descubra os filmes mais populares do momento
- 🔍 **Pesquisa em Tempo Real**  
  Encontre filmes instantaneamente enquanto digita
- 🖱️ **Overlay Interativo**  
  Passe o mouse para ver opções de streaming
- ♾️ **Scroll Infinito**  
  Carrega mais filmes automaticamente
- 📱 **Design Responsivo**  
  Funciona perfeitamente em todos os dispositivos
- ⚡ **Performance Otimizada**  
  Cache inteligente de dados da API

## 🚀 Como Começar

### Pré-requisitos
- Navegador moderno
- Conta gratuita no [TMDB](https://www.themoviedb.org/)

- ### Atenção:
- vou deixar minha chave api no script uns dois meses pra vc que não tem muito conhecimento usar o app de boa; 
- Instale no seu notebook ou desktop e se quizer clone a tela deste na sua smart tv para assistir os filmes direto na tv!
- deixei todos os filmes com o provedor que da acesso para assistir os filmes online na faixa!💕
### Instalação

# 👌Ter Node 22 lts instalado na sua maquina
```bash
# Clone o repositório
git clone https://github.com/CarlosLacerdaSantos/myExpressAp_filmes.git

# Acesse a pasta do projeto
cd myExpressAp_filmes
node ./bin/www 
# No navegador abra 
http://localhost:3001
# Caso não tenha dado certo verifique:
# Você tem uma chave API do TMDB ? porque pode ser que a chave que deixei no script ja esteja indisponivel
# Voçê tem node.js 22 LTS instalado em sua maquína ?

# Obtenha sua API Key no TMDB e crie um arquivo .env
echo "API_KEY=sua_chave_aqui" > .env


