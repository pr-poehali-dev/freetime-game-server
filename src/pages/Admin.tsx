import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: number;
  user_id: string;
  telegram_username: string | null;
  product_name: string;
  product_type: string;
  stars_amount: number;
  token: string;
  status: string;
  minecraft_nick: string | null;
  created_at: string;
  expires_at: string | null;
  activated_at: string | null;
  notes: string | null;
}

function Admin() {
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [notes, setNotes] = useState<string>('');
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/8aff155f-e642-460c-aa34-4a6878d59c38';

  const loadTransactions = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const url = filterStatus !== 'all' 
        ? `${API_URL}?status=${filterStatus}`
        : API_URL;
      
      const response = await fetch(url, {
        headers: {
          'X-Admin-Token': adminToken
        }
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        toast({
          title: 'Ошибка',
          description: 'Неверный токен администратора',
          variant: 'destructive'
        });
        return;
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить транзакции',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (adminToken.trim()) {
      setIsAuthenticated(true);
      loadTransactions();
    }
  };

  const handleUpdateStatus = async (transactionId: number, newStatus: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          action: 'update_status',
          status: newStatus,
          notes: notes
        })
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Статус обновлён'
        });
        loadTransactions();
        setSelectedTransaction(null);
        setNotes('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      activated: 'default',
      expired: 'destructive',
      cancelled: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [filterStatus, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-heading text-3xl text-center">🔐 Админ-панель</CardTitle>
            <CardDescription className="text-center">Введите токен доступа для входа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Токен администратора"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button className="w-full" onClick={handleLogin}>
              <Icon name="LogIn" className="mr-2" />
              Войти
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Токен по умолчанию: admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-bold text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Админ-панель
            </h1>
            <p className="text-muted-foreground mt-2">Управление транзакциями и заказами</p>
          </div>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            <Icon name="LogOut" className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего транзакций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ожидают</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {transactions.filter(t => t.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Активированы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {transactions.filter(t => t.status === 'activated').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Общая сумма Stars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {transactions.reduce((sum, t) => sum + t.stars_amount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="font-heading text-2xl">Транзакции</CardTitle>
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Фильтр по статусу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="pending">Ожидают</SelectItem>
                    <SelectItem value="activated">Активированы</SelectItem>
                    <SelectItem value="expired">Истекли</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadTransactions} disabled={loading}>
                  <Icon name="RefreshCw" className={loading ? 'animate-spin mr-2' : 'mr-2'} />
                  Обновить
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={32} />
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Транзакций пока нет</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Stars</TableHead>
                      <TableHead>Токен</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Minecraft</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono">{transaction.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.telegram_username || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{transaction.user_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.product_name}</div>
                            <div className="text-xs text-muted-foreground">{transaction.product_type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.stars_amount} ⭐</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{transaction.token}</code>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{transaction.minecraft_nick || '-'}</TableCell>
                        <TableCell className="text-xs">
                          {new Date(transaction.created_at).toLocaleString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setNotes(transaction.notes || '');
                                }}
                              >
                                <Icon name="MoreVertical" size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Транзакция #{transaction.id}</DialogTitle>
                                <DialogDescription>
                                  Управление транзакцией
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Изменить статус</label>
                                  <div className="flex gap-2 mt-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(transaction.id, 'pending')}
                                    >
                                      Ожидает
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(transaction.id, 'activated')}
                                    >
                                      Активирован
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(transaction.id, 'cancelled')}
                                    >
                                      Отменён
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Заметки</label>
                                  <Textarea 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Добавьте заметку..."
                                    rows={3}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Admin;
