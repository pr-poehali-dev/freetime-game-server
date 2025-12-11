import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Theme = 'theme-dark' | 'theme-bright' | 'theme-green' | 'theme-gamer';

const privileges = [
  { name: 'Барон', price: 'Бесплатно', icon: '🎖️', features: ['Префикс [Барон]', '/kit Барон', '2 дома', 'Базовые команды'] },
  { name: 'Виконт', price: '150 руб.', icon: '⭐', features: ['Префикс [Виконт]', '/kit Виконт', '5 домов', '/back', 'Цветной ник'] },
  { name: 'Граф', price: '350 руб.', icon: '💎', features: ['Префикс [Граф]', '/kit Граф', '8 домов', '/fly 30 мин', '/hat'] },
  { name: 'Маркиз', price: '550 руб.', icon: '👑', features: ['Префикс [Маркиз]', '/kit Маркиз', '12 домов', '/fly 1 час', '/heal'] },
  { name: 'Герцог', price: '750 руб.', icon: '🏆', features: ['Префикс [Герцог]', '/kit Герцог', '15 домов', '/fly 2 часа', '/feed'] },
  { name: 'Спонсор', price: '850 руб.', icon: '🌟', features: ['Префикс [Спонсор]', '/kit Спонсор', '15 домов', '/fly безлимит', '/god 30 мин'] },
  { name: 'Принц', price: '1200 руб.', icon: '👑', features: ['Префикс [Принц]', '/kit Принц', '20 домов', '/fly безлимит', '/god 1 час'] },
  { name: 'Король', price: '1500 руб.', icon: '🔱', features: ['Префикс [Король]', '/kit Король', '25 домов', 'Все предыдущие', '/god 2 часа'] },
  { name: 'Император', price: '2000 руб.', icon: '🎭', features: ['Префикс [Император]', '/kit Император', '30 домов', 'Все предыдущие', '/god безлимит'] },
  { name: 'Легенда', price: '3000 руб.', icon: '⚡', features: ['Префикс [Легенда]', '/kit Легенда', '40 домов', 'Все предыдущие', 'Особые эффекты'] },
  { name: 'Мифик', price: '4000 руб.', icon: '🔥', features: ['Префикс [Мифик]', '/kit Мифик', '50 домов', 'Все предыдущие', 'Уникальные возможности'] },
  { name: 'Бессмертный', price: '5000 руб.', icon: '💫', features: ['Префикс [Бессмертный]', '/kit Бессмертный', '75 домов', 'Все предыдущие', 'Максимальные привилегии'] },
  { name: 'Божество', price: '7500 руб.', icon: '🌌', features: ['Префикс [Божество]', '/kit Божество', '100 домов', 'ВСЕ возможности', 'Эксклюзивный статус'] }
];

const storeItems = [
  { name: 'Кейс', price: '2 руб.', icon: '📦', description: 'Случайные предметы' },
  { name: 'Токен-кейс', price: '10 руб.', icon: '🎁', description: 'Редкие награды' },
  { name: 'Донат-кейс', price: '25 руб.', icon: '💰', description: 'Эпические предметы' },
  { name: 'Размут', price: '5 руб.', icon: '🔇', description: 'Снять мут' },
  { name: 'Разбан', price: '100 руб.', icon: '🔓', description: 'Снять бан' },
  { name: 'Ключи', price: '2 руб.', icon: '🔑', description: 'Открыть кейсы' },
  { name: 'Анархия пасс', price: '30 руб.', icon: '⚔️', description: 'Доступ к анархии' },
  { name: 'Баланс', price: '2 руб./ед.', icon: '💵', description: 'Игровая валюта' },
  { name: 'Токены', price: '1 руб./2000', icon: '🪙', description: 'Внутриигровые токены' }
];

const rules = [
  {
    title: 'Основные правила',
    items: ['Уважайте других игроков', 'Запрещён читинг и использование модов', 'Не спамьте в чате', 'Следуйте указаниям администрации']
  },
  {
    title: 'Правила чата',
    items: ['Не оскорбляйте других игроков', 'Запрещена реклама других серверов', 'Не флудите', 'Запрещена политика и религия']
  },
  {
    title: 'Игровой процесс',
    items: ['Запрещён гриферство без согласия', 'Не убивайте в безопасных зонах', 'Запрещены багоюзы', 'Не создавайте лаги']
  },
  {
    title: 'Платные услуги',
    items: ['Возврат средств только по ошибке системы', 'Покупки не передаются другим игрокам', 'Бан не отменяет покупки', 'Читайте описание перед покупкой']
  }
];

const reviews = [
  { nick: 'Steve_Pro', text: 'Лучший сервер! Отличная администрация и дружное комьюнити', rating: 5, date: '15.11.2024' },
  { nick: 'Alex_Miner', text: 'Много привилегий, интересные ивенты. Играю уже полгода', rating: 5, date: '10.11.2024' },
  { nick: 'Creeper_228', text: 'Хороший сервер, но бывают лаги', rating: 4, date: '05.11.2024' },
  { nick: 'Diamond_King', text: 'Справедливые админы, адекватные правила', rating: 5, date: '01.11.2024' },
  { nick: 'Enderman_X', text: 'Отличная экономика и магазин', rating: 4, date: '28.10.2024' },
  { nick: 'Zombie_Hunter', text: 'Много ивентов и активности', rating: 5, date: '25.10.2024' },
  { nick: 'Skeleton_Bow', text: 'Нормальный сервер для выживания', rating: 4, date: '20.10.2024' },
  { nick: 'Blaze_Fire', text: 'Хорошая оптимизация', rating: 4, date: '15.10.2024' },
  { nick: 'Witch_Magic', text: 'Интересные квесты и задания', rating: 5, date: '10.10.2024' },
  { nick: 'Villager_Trader', text: 'Отличный сервер для новичков', rating: 4, date: '05.10.2024' }
];

function Index() {
  const [theme, setTheme] = useState<Theme>('theme-dark');
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePurchase = (productName: string, price: string) => {
    toast({
      title: '🎮 Перейдите в Telegram',
      description: `Для покупки "${productName}" (${price}) перейдите в бота @FreeTimeSRV_bot`,
    });
    window.open('https://t.me/FreeTimeSRV_bot', '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="text-4xl">⛏️</div>
              <div>
                <h1 className="font-heading font-bold text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  FreeTime
                </h1>
                <p className="text-sm text-muted-foreground">Игровой сервер</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {['home', 'privileges', 'store', 'rules', 'reviews', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'privileges' && 'Привилегии'}
                  {section === 'store' && 'Магазин'}
                  {section === 'rules' && 'Правила'}
                  {section === 'reviews' && 'Отзывы'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
              <button
                onClick={() => navigate('/admin')}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                🔐 Админ
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-card p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={theme === 'theme-bright' ? 'default' : 'ghost'}
                  onClick={() => setTheme('theme-bright')}
                  className="px-3"
                >
                  ☀️
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'theme-dark' ? 'default' : 'ghost'}
                  onClick={() => setTheme('theme-dark')}
                  className="px-3"
                >
                  🌙
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'theme-green' ? 'default' : 'ghost'}
                  onClick={() => setTheme('theme-green')}
                  className="px-3"
                >
                  🌿
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'theme-gamer' ? 'default' : 'ghost'}
                  onClick={() => setTheme('theme-gamer')}
                  className="px-3"
                >
                  🎮
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="home" className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-glow" />
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-slide-up">
            <h2 className="font-heading font-extrabold text-5xl md:text-7xl mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Добро пожаловать на FreeTime
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Лучший игровой сервер с уникальными режимами, честной администрацией и активным сообществом
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
            <Card className="bg-card/50 backdrop-blur border-primary/50 hover:border-primary transition-all hover:scale-105">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">IP адрес сервера:</p>
                <p className="font-heading font-bold text-2xl text-primary">FreeTime.gomc.me</p>
              </CardContent>
            </Card>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold px-8">
              <Icon name="Rocket" className="mr-2" />
              Подключиться сейчас!
            </Button>
          </div>

          <div className="flex gap-4 justify-center items-center flex-wrap animate-scale-in">
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Send" size={20} />
              @FreeTimeSRV_bot
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="MessageCircle" size={20} />
              Discord
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Youtube" size={20} />
              YouTube
            </Button>
          </div>
        </div>
      </section>

      <section id="privileges" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Привилегии
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Выберите подходящую привилегию и получите уникальные возможности
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {privileges.map((priv, idx) => (
              <Card 
                key={priv.name} 
                className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 border-2 hover:border-primary bg-gradient-to-br from-card to-card/50"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardHeader>
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{priv.icon}</div>
                  <CardTitle className="font-heading text-2xl">{priv.name}</CardTitle>
                  <CardDescription className="text-xl font-bold text-primary">{priv.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {priv.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
                    onClick={() => handlePurchase(priv.name, priv.price)}
                  >
                    <Icon name="Star" className="mr-2" size={16} />
                    Купить через Telegram Stars
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="store" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            Магазин
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Внутриигровые товары для улучшения игрового опыта
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeItems.map((item, idx) => (
              <Card 
                key={item.name}
                className="hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/50 border-2 hover:border-secondary"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <CardTitle className="font-heading">{item.name}</CardTitle>
                  <CardDescription className="text-lg font-bold text-secondary">{item.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white font-bold"
                    onClick={() => handlePurchase(item.name, item.price)}
                  >
                    <Icon name="ShoppingCart" className="mr-2" size={16} />
                    Купить
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="rules" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Правила сервера
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Ознакомьтесь с правилами перед началом игры
          </p>
          
          <Accordion type="single" collapsible className="space-y-4 mb-8">
            {rules.map((section, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="font-heading text-lg hover:text-primary">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pt-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Icon name="CheckCircle2" size={16} className="text-accent mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center">
            <Button size="lg" variant="outline" className="gap-2">
              <Icon name="Download" />
              Скачать правила PDF
            </Button>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Отзывы игроков
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Что говорят наши игроки о сервере
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <Card 
                key={idx}
                className="hover:scale-105 transition-all duration-300 hover:shadow-xl"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-lg">{review.nick}</CardTitle>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Icon key={i} name="Star" size={16} className="fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <CardDescription className="text-xs">{review.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Контакты
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Свяжитесь с нами или оставьте обратную связь
          </p>
          
          <Card className="backdrop-blur border-2">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Ваш никнейм</label>
                  <Input placeholder="Steve_Pro" className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Тема обращения</label>
                  <Input placeholder="Вопрос о привилегиях" className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Сообщение</label>
                  <Textarea 
                    placeholder="Опишите ваш вопрос или предложение..." 
                    rows={5}
                    className="bg-background resize-none"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold" size="lg">
                  <Icon name="Send" className="mr-2" />
                  Отправить сообщение
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-center text-sm text-muted-foreground mb-4">Социальные сети:</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="Send" size={16} />
                    @FreeTimeSRV_bot
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="MessageCircle" size={16} />
                    Discord
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="Youtube" size={16} />
                    YouTube
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-3xl">⛏️</div>
            <h3 className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FreeTime Server
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            © 2024 FreeTime. Все права защищены.
          </p>
          <p className="text-xs text-muted-foreground">
            Игровой сервер Minecraft с уникальными режимами и честной администрацией
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Index;