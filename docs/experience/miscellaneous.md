# 一些算法/编程题
## MOVA
```go
package main

import (
	"fmt"
	"sync"
)

const CONCURRENCY = 10

// 给指定的切片去重，使用多个 goroutine 并发处理
func UniqSliceLock(input []int) []int {
	if len(input) == 0 {
		return []int{}
	}

	var (
		wg     sync.WaitGroup
		mu     sync.Mutex
		global = make(map[int]bool) // 全局的去重集合
		n      = len(input)
		chunk  = (n + CONCURRENCY - 1) / CONCURRENCY // 每个块的大小，向上取整
	)

	for i := 0; i < CONCURRENCY; i++ {
		start := i * chunk
		end := start + chunk
		if start >= n {
			break
		}
		if end > n {
			end = n
		}

		wg.Add(1)
		go func(part []int) {
			defer wg.Done()

			// 每个goroutine先用本地map记录自己区间内的唯一值
			local := make(map[int]bool)
			for _, v := range part {
				local[v] = true
			}

			// 加锁并将本地数据合并到全局
			mu.Lock()
			for v := range local {
				global[v] = true
			}
			mu.Unlock()
		}(input[start:end])
	}

	wg.Wait()

	// 将全局map转换为切片
	result := make([]int, 0, len(global))
	for v := range global {
		result = append(result, v)
	}

	return result
}

func main() {
	input := []int{1, 2, 3, 1, 2, 3}
	fmt.Println(UniqSliceCh(input))
}

func UniqSliceCh(input []int) []int {
	global := make(map[int]bool)
	ch := make(chan int)

	n := len(input)
	chunk := (n + CONCURRENCY - 1) / CONCURRENCY // 每个块的大小，向上取整

	var wg sync.WaitGroup
	for i := 0; i < CONCURRENCY; i++ {
		start := i * chunk
		end := start + chunk
		if start >= n {
			break
		}
		if end > n {
			end = n
		}

		wg.Add(1)
		go func(part []int) {
			defer wg.Done()
			// 每个goroutine先用本地map记录自己区间内的唯一值
			local := make(map[int]bool)
			for _, v := range part {
				local[v] = true
			}

			// 加锁并将本地数据合并到全局
			for v := range local {
				ch <- v
			}
		}(input[start:end])
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for v := range ch {
		global[v] = true
	}

	result := make([]int, 0, len(global))
	for v := range global {
		result = append(result, v)
	}

	return result
}
```

## 地平线
```go
// golang版击鼓传花
// 由n个节点组成一个环状网络,在上面传送共m个消息。
// 将每个消息(共m个),逐个发送给1号节点。
// 第1到n-1号节点在接收到消息后,都转发给下一号节点。
// 第n号节点每次收到消息后,不再继续转发。
// 当m个消息都从1号逐个到达第n号节点时,认为全部处理结束。
// 每次执行时设定n=300,m=10000
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

const (
	n = 3
	m = 10
)

func main() {
	chans := make([]chan int, n)
	for i := 0; i < n; i++ {
		chans[i] = make(chan int)
	}

	var wg sync.WaitGroup
	var received int64 // n号节点统计

	for i := 0; i < n; i++ {
		wg.Add(1)
		go func(idx int, in <-chan int, out chan<- int) {
			defer wg.Done()
			for msg := range in {
				fmt.Printf("当前节点是 %d, 当前消息是 %d\n", idx, msg)
				if out != nil {
					out <- msg
				} else {
					atomic.AddInt64(&received, 1)
				}
			}
			if out != nil {
				close(out)
			}
		}(i, chans[i], func() chan int {
			if i < n-1 {
				return chans[i+1]
			}
			return nil
		}())
	}

	begin := time.Now()
	for i := 1; i <= m; i++ {
		chans[0] <- i
	}
	close(chans[0])
	wg.Wait()
	timeSpent := time.Since(begin)
	fmt.Printf("消息处理完毕，共收到 %d 个消息，耗时为 %v\n", atomic.LoadInt64(&received), timeSpent)
}
```

## 循迹
```go
// 并发安全的缓存组件
package main

import (
	"sync"
	"time"
)

// item表示缓存中的一个条目
type item struct {
	value      interface{}
	expiration int64 // 过期时间（ns），0表示永不过期
}

// Cache是并发安全的缓存结构
type Cache struct {
	items           map[string]*item
	mu              sync.RWMutex
	cleanupInterval time.Duration
	stopCleanup     chan struct{}
}

// NewCache创建一个新的缓存实例
func NewCache(cleanupInterval time.Duration) *Cache {
	c := &Cache{
		items:           make(map[string]*item),
		cleanupInterval: cleanupInterval,
		stopCleanup:     make(chan struct{}),
	}
	if cleanupInterval > 0 {
		// 定期删除
		go c.cleanup()
	}
	return c
}

// Set 函数添加一个键值对，ttl为过期时长，0表示永不过期
func (c *Cache) Set(key string, value interface{}, ttl time.Duration) {
	var exp int64
	if ttl > 0 {
		exp = time.Now().Add(ttl).UnixNano()
	}
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = &item{
		value:      value,
		expiration: exp,
	}
}

// Get 获取键对应的值，如果键不存在或已过期，返回 (nil, false)
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	item, ok := c.items[key]
	c.mu.RUnlock()
	if !ok {
		return nil, false
	}

	// 检查是否过期
	if item.expiration > 0 && (time.Now().UnixNano() > item.expiration) {
		// 过期，惰性删除
		c.mu.Lock()
		// 再次检查防止在获得写锁前被其他 goroutine 删除或更新
		if item2, ok := c.items[key]; ok && item2 == item && (time.Now().UnixNano() > item2.expiration) {
			delete(c.items, key)
		}
		c.mu.Unlock()
		return nil, false
	}

	return item.value, true
}

// Delete 删除指定键
func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

// cleanup 定期清理过期项
func (c *Cache) cleanup() {
	ticker := time.NewTicker(c.cleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.deteleExpired()
		case <-c.stopCleanup:
			// 停止清理
			return
		}
	}
}

func (c *Cache) deteleExpired() {
	now := time.Now().UnixNano()
	c.mu.Lock()
	defer c.mu.Unlock()

}
```