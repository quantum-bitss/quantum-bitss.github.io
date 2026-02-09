# Classic Crypto

## Symmetric Key Cryptography

### Kerckhoff's Principle: The key(s) of a cryptosystem should be hidden, but the mechanisms should be public.

* Experience has shown that secret algorithms tend to be weak when exposed

* Secret algorithms never remain secret

* <span style="color: rgb(216,57,49); background-color: inherit">Better to find weakness beforehand</span>

### Symmetric Key Cryptography: a single key (k) is used for E and D

![](<images/Principle of Cybersecurity-image-13.png>)

#### Simple Substitution

* shift by n (n is the key)

![](<images/Principle of Cybersecurity-image-14.png>)

Caesar's cipher: shift by 3

Attack I: Exhaustive key search-try them all. Only 25 keys possible.

* General case: any permutation of letters, 26! variations in total 每个letter都可能对应一个不一样的letter

Attack II: Cannot try 26! combinations, we can use the frequency of English letters

![](<images/Principle of Cybersecurity-image-11.png>)

Again, Principle: Cryptosystem is secure if the best-known attack is to <span style="color: rgb(216,57,49); background-color: inherit">try all keys</span> (exhaustive key search). Cryptosystem is insecure if <span style="color: rgb(216,57,49); background-color: inherit">any shortcut attack is known</span>.

#### One-Time Pad (OTP)

XOR: 相同为0，不同为1（<span style="color: rgb(216,57,49); background-color: inherit">0和任何数</span> <span style="color: rgb(216,57,49); background-color: inherit">异或</span> <span style="color: rgb(216,57,49); background-color: inherit">都是那个数自己</span>）

* Encryption: plaintext XOR key = ciphertext

* Decryption: ciphertext XOR key = plaintext

Requirements:

* <span style="color: rgb(216,57,49); background-color: inherit">Pad (key) must be </span>**<span style="color: rgb(216,57,49); background-color: inherit">random, used only once</span>**

* <span style="color: rgb(216,57,49); background-color: inherit">Pad must be the same size as message</span>

OTP is provably secure: <span style="color: rgb(216,57,49); background-color: inherit">ciphertext gives no information about </span> <span style="color: rgb(216,57,49); background-color: inherit">plaintext</span>. Assume value of each bit is equally likely, then all ciphertexts are also equally likely.

假设pad被使用两次：C1=M1 XOR K    C2=M2 XOR k，那么攻击者可以得到C1 XOR C2=M1 XOR M2，也就得到了M1和M2之间的关系，也就有了破译密文的可能。

#### Codebook Cipher

A book filled with codewords, with everyword in this book has a code

Additive：<span style="color: inherit; background-color: rgba(255,246,122,0.8)">在普通的codebook cipher中，同一个词会被映射为同一个code</span>，容易被攻击者按照频率pattern破译。配合一个additive book，每次encrypt的时候，选出一页（一个additive position），将code与这一页的数字逐位相加。每次发送时，<span style="color: rgb(216,57,49); background-color: inherit">发送cyphertext和additive position</span>。additive position本身不是secret，其内容是需要保密的。收件人收到内容后用减法还原原始code。这样，attacker看到的同一个词的cyphertext都不一样（same word encodes into different representations），因此难以破译。

# Symmetric Key Crypto

## Modern Symmetric Key Crypto

Stream cipher:

* generalize one-time pad

* Key is relatively short, it <span style="color: rgb(216,57,49); background-color: inherit">works on one bit/byte a time 一次加密一个bit/byte，连续加密</span>

* Key is<span style="color: rgb(216,57,49); background-color: inherit"> stretched into a long key stream</span>

* Keystream is used just like a one-time pad

Block cipher:

* works on large chunks of data (block) at a time <span style="color: rgb(216,57,49); background-color: inherit">一次加密一个数据块</span>

* can combine blocks for additional security

### Stream Cipher

![](<images/Principle of Cybersecurity-image-12.png>)

#### A5/1: Shift Registers

A5/1 uses 3 shift registers to generate one-time pad

X: 19 bits

Y: 22 bits

Z: 23 bits

![](<images/Principle of Cybersecurity-image.png>)

每一轮选出<span style="color: rgb(216,57,49); background-color: rgba(255,246,122,0.8)">x8 y10 z10</span>中出现最多的数字m，哪个register的对应位是m，则向右移一位，空出的第一位按照上面的规则计算。最终的Keystream bit由三个register最右边的位异或得到。

Shift register crypto is efficient in hardware, slow if implemented in software.

#### RC4

S=\[0, 1, 2, ..., 255]

Step1: 利用密钥K对S进行shuffle

```json
j = 0
for i = 0 to 255:
    j = (j + S[i] + K[i mod keylen]) mod 256
    swap(S[i], S[j])
```

Step2: 生成keystream byte

```json
i = 0
j = 0
while generating:
    i = (i + 1) mod 256
    j = (j + S[i]) mod 256
    swap(S[i], S[j])
    t = (S[i] + S[j]) mod 256
    K = S[t]
    output K
```

Step3: Use keystream bytes like a one-time pad

### Block Cipher

Block cipher：plaintext和cyphertext都是由固定大小的bit块组成，cyphertext是由每一round的加密函数迭代获得的，函数的输入有key和前一round的output。通常由软件实现

#### Feistel Cipher

Feistel cipher是一个block cipher framework

* Encryption:

Split plaintext block into left and right components: P=(L0, R0)

For each round i=0, 1, ..., n, compute

Li+1=Ri, Ri+1=Li XOR F(Ri, Ki) where <span style="color: rgb(216,57,49); background-color: inherit">F is round function and Ki is subkey</span>

Ciphertext: C=(Rn+1, Ln+1)

* Decryption:

Start with C=(Rn+1, Ln+1)

For each round i=n+1, n, ..., 1, compute

Ri-1=Li, Li-1=Ri XOR F(Li, Ki-1) where <span style="color: rgb(216,57,49); background-color: inherit">F is round function and Ki is subkey</span>

Plaintext: P=(L0, R0)

### DES

<span style="color: rgb(216,57,49); background-color: inherit">64-bit block length</span>,<span style="color: rgb(216,57,49); background-color: inherit"> 56-bit key length</span>, 16 rounds, <span style="color: rgb(216,57,49); background-color: inherit">48 </span> <span style="color: rgb(216,57,49); background-color: inherit">bits</span> <span style="color: rgb(216,57,49); background-color: inherit"> of key used each round</span>

![](<images/Principle of Cybersecurity-image-1.png>)

#### Round function

**Expansion**

由扩展表控制。将32bit每4bit分为一组，在组与组之间的边界插入边界的bit值

![](<images/Principle of Cybersecurity-image-2.png>)

**S-box-substitution**

S-box是一个lookup table，输入是m bit，输出是n bit，总共有8个S-box（输入6bit，输出4bit，共8组）

![](<images/Principle of Cybersecurity-image-3.png>)

**P-box-permutation**

一个固定的映射表，将n bit的输入信号重新编号并打乱

**Subkey**

将56bit分为左右两个部分（Ci和Di），都是28bit

DES共有16个round，每一个round中Ci和Di都要循环左移一个特定的位数

将合并后的Ci和Di经过Permuted Choice 2 (PC-2)的置换与选取操作：从56bits中挑选48bits，组成当前round的subkey

在第i round中，这48bit的Ki与经过扩展后的48bit数据进行异或，然后进入S-box

**F(Ri, Ki)**

首先把右半部分32bit扩展为48bit

然后和48bit的subkey进行异或

把结果分为8组，每组有6bit

每一组6bit输入到一个S-box中，输出为4bit

所有8个S-box的输出拼接到一起，形成32bit的结果

最后再经过P-box打乱顺序，后面再根据Feistel framework继续进行

### Triple DES

56bit的keys太小了，可以用exhaustive key search破解

3DES用两个独立的key进行encrypt，因此key的长度是56+56=112

![](<images/Principle of Cybersecurity-image-4.png>)

Why Encrypt-Decrypt-Encrypt with 2 keys? Why not encrypt-encrypt-encrypt mode?

Backward compatible: E(D(E(P, K), K), K)=E(P, K) 当只使用一个key时，<span style="color: rgb(216,57,49); background-color: inherit">可以向后兼容，恢复为普通</span> <span style="color: rgb(216,57,49); background-color: inherit">DES</span>（和普通DES兼容）<span style="color: rgb(216,57,49); background-color: inherit">112位key空间已经足够大</span>

**Meet-in-the-middle attack:&#x20;**&#x653B;击者可能尝试利用E(P, K1)=D(C, K2)的中间结果进行表查找

Step 1: 假设单次加密用的key长度为n，那么所有的K1有2^n个，计算中间值X=E(P, K1)，把(X, K1)存入哈希表，时间约2^n，空间约2^n

Step 2: 枚举所有可能的K2，计算Y=D(C, K2)，每次查表看Y是否存在step 1的表中；若找到匹配，则候选key为表中的(K1, K2)

Step 3：对所有候选(K1, K2)用额外的plaintext/cypertext对验证以剔除伪解

### AES

Block size: 128 bits (16 bytes)

Key length: 128 192 256 bits

Round: 10-14

Each round uses 4 functions (ByteSub, ShiftRow, MixColumn, AddRoundKey)

#### ByteSub

Treat a 128 bit block as a 4\*4 byte array

ByteSub is AES's S-box

![](<images/Principle of Cybersecurity-image-5.png>)

#### ShiftRow

![](<images/Principle of Cybersecurity-image-6.png>)

#### MixColumn

把每一列视作一个4byte向量，将每一列与一个固定4\*4矩阵相乘（矩阵乘向量），得到新的列。

最后一个round不做MixColumn。

![](<images/Principle of Cybersecurity-image-7.png>)

#### AddRoundKey

将当前矩阵与当前round的key逐字节做XOR

![](<images/Principle of Cybersecurity-image-8.png>)

### Overview of Linear Cryptoanalysis

* Non-linear functions (i.e., <span style="color: rgb(216,57,49); background-color: inherit">s-box</span>) are the primary contribution of security of block ciphers

* To attack, we approximate the non-linearity with linear equations

## CIA Principle

* Confidentiality: 保密性，除了有权限者没有人能读取信息内容

* Integrity: 数据是原信息的<span style="color: rgb(216,57,49); background-color: inherit">accurate and unchanged representations</span>

* Availability: 有权限者可以获取数据

## Block cipher modes

How to encrypt multiple blocks?

### Electronic Codebook (ECB)

![](<images/Principle of Cybersecurity-image-9.png>)

For a fixed key, this is an electronic version of a codebook cipher (without additive), with a different codebook for each key.

ECB weakness:

* 攻击者虽然无法直接破解key，但是可以通过Cut and Paste的方式对block内容进行重排，<span style="color: rgb(216,57,49); background-color: inherit">破坏integrity</span>

![](<images/Principle of Cybersecurity-image-10.png>)

* 相同的plaintext也有着相同的cyphertext，这给了攻击者信息 Ci=Cj, Pi=Pj

![](<images/Principle of Cybersecurity-image-29.png>)

### Cipher Block Chaining (CBC)

Blocks are chained together. <span style="color: rgb(216,57,49); background-color: inherit">Use a random initialization </span> <span style="color: rgb(216,57,49); background-color: inherit">vector</span> <span style="color: rgb(216,57,49); background-color: inherit"> (IV) to initialize CBC</span>

IV is random, but not secret

![](<images/Principle of Cybersecurity-image-28.png>)

Similar to codebook with additive. Identical blocks yield different cyphertext blocks.

If there is transmission error, the error can only influence limited decryptions. 假设C1由于传输错误接收为G

![](<images/Principle of Cybersecurity-image-27.png>)

Cut and Paste is still possible.

### Counter (CTR)

![](<images/Principle of Cybersecurity-image-15.png>)

## Integrity

### Data Integrity

Integrity 完整性: detect unauthorized writing

Encryption provides condentiality, but <span style="color: rgb(216,57,49); background-color: inherit">does not provide integrity</span>

### MAC

Message Authentication Code: used for data integrity 验证数据完整性和来源真实性的加密工具，用于确保消息在传播过程中<span style="color: rgb(216,57,49); background-color: inherit">没有被篡改</span>，并且<span style="color: rgb(216,57,49); background-color: inherit">确实来自拥有key的一方</span>

Integrity != Confidentiality：confidentiality防止别人看懂，integrity防止别人改动，两者要配合使用

#### MAC computation

![](<images/Principle of Cybersecurity-image-16.png>)

![](<images/Principle of Cybersecurity-image-17.png>)

Encrypt和MAC需要用两个不同的key，不然仅仅是把最后一个cyphertext block发送了两次，并不能增加security

### Quantum Computer

For an n bit symmetric key,&#x20;

* Conventional computer: 2^(n-1)

* Grover's algorithm: 2^(n/2)

# Public Key Crypto

Public Key Encryption:  encryption and decryption using two different keys

* Public key is used for encryption

* Private key is used for decryption

Trap door, one way function, easy to compute in one direction, but hard to compute in other direction

PKE and Digital Signature:

* PKE: encrypt M with Bob's public key, Bob's private key can decrypt C to recover M

* Digital Signature: Bob signs by encrypting  with his private key, any one can verify signature by decrypting with Bob's public key 如果可以用Bob的public key decrypt，则代表这是Bob的签名

## RSA

### Encryption and Decryption

#### Algorithm

[link](https://blog.csdn.net/a745233700/article/details/102341542)

Let p and q be two large prime numbers

Let N=pq be the modulus

Choose e relatively prime to (p-1)(q-1)  使得e和(p-1)(q-1)的最大公约数是1，也就是e和(p-1)(q-1)互质

Find d such that <span style="color: rgb(216,57,49); background-color: inherit">ed mod (p-1)(q-1) = 1</span>

Public key is (N, e)

Private key is  d

* Encryption: <span style="color: rgb(216,57,49); background-color: inherit">C=M^e mod N</span>

* Decryption: <span style="color: rgb(216,57,49); background-color: inherit">M=C^d mod N</span>

#### RSA Collision

存在两个不同的明文M1!=M2，加密后出现相同的密文C，几乎不可能出现

### Efficient RSA

Repeated Squaring

Step 1：首先把幂次分解为二进制 20=(10100)=2^4+2^2

5^20=5^16\*5^4

Step 2：从小到大平方取模

Step 3：乘上需要的幂次再取模

5^20 mod 35=(5^16\*5^4) mod 35=(30\*30) mod 35=900 mod 35=25

RSA Limits:

* **<span style="color: rgb(216,57,49); background-color: inherit">M&lt;n，明文必须小于模数</span>**，2048bit的模数只能加密256字节的数据（否则会导致密文的碰撞）

* 把整条数据分块（245字节块），每一块单独用RSA加密，会导致文件尺寸变大（变为256字节的密文块，和N的大小相同），并且速度变慢

Hybrid Cryptosystem: RSA+symmetric key encryption，<span style="color: rgb(216,57,49); background-color: inherit">用RSA加密一个较小的AES key，用AES key加密较长的消息</span>。接收方用RSA private key得到AES key，然后解密得到消息明文。

* RSA加密一个较小的key，AES加密较长的消息，速度快效率高

* SSL/OpenPGP

![](<images/Principle of Cybersecurity-image-18.png>)

### Quantum Computer

QC is a big threat to public key, Shor's algorithm, much faster than best classic factoring algorithm

Symmetric ciphers will be OK, but QC will make most popular public key algorithms obsolete (RSA, Diffie-Hellman) 大数因式分解

## Diffie-Hellman

A key exchange algorithm, used to establish a shared symmetric key, <span style="color: rgb(216,57,49); background-color: inherit">not for encrypting or signing 如何安全的构建一个共享的key</span>

### Algorithm

Public: 一个大素数p，一个基数g （所有人可见）

Step 1: Alice随机选择一个private key a，计算public key A=g^a mod p，把A发给Bob

Step 2: Bob随机选择一个private key b，计算public key B=g^b mod p，把B发给Alice

Step 3: 双方计算共享key

Alice: K=B^a mod p=g^ab mod p

Bob: K=A^b=g^ab mod p

因此K=g^ab mod p

Discrete Log problem: given g, p, and g^k mod p, need to find k, very hard to solve

![](<images/Principle of Cybersecurity-image-19.png>)

### Man-in-the-middle attack (MiM)

![](<images/Principle of Cybersecurity-image-20.png>)

攻击者在中间拦截通讯信息（Alice和Bob不知道MiM的存在），并用自己的key加密后发给Bob和Alice，会导致Alice和Bob生成不一样的symmetric key

Alice: g^at mod p

Bob: g^bt mod p

可以对发送的消息用RSA签名防御MiM attack

## Signature with RSA

* Encryption: 保证confidentiality，接收者的public key加密，接收者的private key解密

* Signature: authentication & non-repudiation（认证与防否认），private key签名，public key验证

Integrity：签名通常是对消息摘要（hash）进行签名，如果有人篡改消息，摘要会发生变化，验证就无法通过

Non-repudiation防抵赖：只有Alice拥有她的私钥，如果某条消息带有Alice私钥签的签名，就说&#x660E;**<span style="color: rgb(216,57,49); background-color: inherit">该消息确实出自她本人</span>**，事后她不能否认

MAC不能够提供non-repudiation:

![](<images/Principle of Cybersecurity-image-21.png>)

## Public Key Infrastructure

### Digital Certificate

<span style="color: inherit; background-color: rgba(255,246,122,0.8)">Recipient怎么确认sender的public key？（用于验证电子签名）</span>

<span style="color: inherit; background-color: rgba(255,246,122,0.8)">Sender怎么确认recipient的public key？（用于发送一条加密的消息）</span>

Use <span style="color: rgb(216,57,49); background-color: inherit">a trusted third party to authenticate that public key belongs to A - </span>Certification Authority (CA)

For each user A, CA creates a message containing A's name and public key (Digital Certificate)

* Digital certificate contains <span style="color: rgb(216,57,49); background-color: inherit">name</span> of user and the<span style="color: rgb(216,57,49); background-color: inherit"> user&#39;s public key</span>.

* It is <span style="color: rgb(216,57,49); background-color: inherit">signed by CA </span>with CA's private key.

* The signature on certificate is verified using CA's public key.

![](<images/Principle of Cybersecurity-image-22.png>)

### Certificate Authority (CA)

* A trusted third party, creates and signs certificates

* Verify signature to verify integrity

* Common format for certificates: X.509

Root CA stored in your OS/browser/application since installation time  受信任的Root CA列表从安装时就已经存在系统中，当访问一个网站时，浏览器会通过链式验证确认它的证书是由这些root CA颁发的。当系统更新时，这些CA列表也会自动更新，删除或吊销破产的CA，增加新的合法CA。

CA通过现实世界的手段验证你是谁，而不是密码学手段。

### PKI

一整套能够让public key crypto在现实世界中安全、可管理地运行的机制

* Key generation and management：如何安全的生成密钥对，如何安全保存密钥，何时轮换，何时吊销

* CA：证明公钥确实属于某个特定实体，颁发证书

* Certificate Revocation Lists (CRLs)：吊销证书列表

No general standard for PKI：每个应用、国家、或公司可能都有自己不同的 CA 管理规则与信任模式

#### Trust Models

* Monopoly Model：只有一个或少数几个CA，所有证书都由它签发，用户默认信任这个CA，一旦被攻破，整个体系就会不安全

* Few Trusted CAs：系统或浏览器预安装几十个root CAs，每个root CA下面有子CA，验证证书时，会根据签发链验证到root

* Every one is a CA：每个人都可以签发别人的证书，构建trust path

## Hash Function

### Motivation

在签名消息M时，如果M很大，则计算的开销很大。Alice签名h(M)，h(M)是一个比M小的多的fingerprint。

![](<images/Principle of Cybersecurity-image-23.png>)

### Crypto Hash Function

H(x) should provide:

* Compression: output length is small (ciphertext必须是plaintext的完整表示，有所有信息，hash只是abstract)

* Efficiency: H(x) is easy to compute for any x

* One-way: given a value y, it is infeasible to find an x such that H(x)=y (ciphertext可以用key退回到plaintext)

* Weak collision resistance: given x and H(x), infeasible to find y!=x, H(y)=H(x) (pre-birthday problem)

* Strong collision resistance: infeasible to find any y!=x, H(y)=H(x) (birthday problem)

#### Pre-Birthday Problem

房间里共有N个人，N必须要多大，才能保证房间里至少有一个人跟我的生日相同的概率大于等于1/2？

1/2=1-(364/365)^N

N=253

#### Birthday Problem

房间里有N个人，N必须要多大，才能保证房间里至少有两个人生日相同的概率大于等于1/2？

房间里每个人生日都不相同的概率 P = 365/365 \* 364/365 \* 363/365 \* ... \* (365-N+1)/365

1-P=1/2

N=23

另一个角度：将N个人两两组成一对，有N(N-1)/2对，每一对生日碰撞的概率是1/365，那么所有人里面平均有一对人生日碰撞的N:

N(N-1)/2 \* 1/365 = 1, N^2=730, N=27

<span style="color: rgb(216,57,49); background-color: inherit">也就是大约到sqrt(365)时，生日碰撞变得频繁</span>

#### Hash Collision

对于Hash function来说，假设有N bits，那么总共可以产生2^N个hash values，**<span style="color: rgb(216,57,49); background-color: inherit">当有2^(N/2)个值需要hash时就可能会出现一个collision</span>**

对于Exhaustive search attack，已知一个N bit hash，<span style="color: rgb(216,57,49); background-color: inherit">需要2^(N/2)多的work来攻破</span>

对于N bit symmetric key，则需要2^N攻破

#### Popular Crypto Hashes

* MD5 (128-bit output, easy to find collision, broken)

* SHA-1 (160-bit output)&#x20;

### Internals of a Hash Function

Merkle-Damgard construction: a fixed-size compression function

![](<images/Principle of Cybersecurity-image-24.png>)

MD5

![](<images/Principle of Cybersecurity-image-25.png>)

### Hash Usage

* Password storage: 注册帐号时，储存密码的hash values而不是密码本身。如果公司储存密码的明文，一旦数据库泄漏，真实密码就会直接泄漏（内部员工，不同网站密码复用）

  * Add a random Salt to the password h(P+S) 防止有用户设置的密码相同

* Authenticator：t作为一个认证令牌，Alice第一次给Bob发送h(t)，第n次给Bob发送t，Bob通过hash验证后知道t是Alice发送的，收到了这个秘密消息。攻击者无法从h(t)推回t，但是可以再次给Bob发送t，用以误导Bob (Replay attack)

![](<images/Principle of Cybersecurity-image-26.png>)

Prevention: hash chain 对于一个令牌t，进行链式hash多次，形成hash chain，每次使用的hash value不一样。假设hash24次，Alice每次给Bob发送h^23(t) h^22(t) ... h^(24-d)(t)。这样，攻击者假设有h^(24-d+1)，无法推出h^(24-d)，hash计算是不可逆的，因此没有办法给Bob发送下一次要发送hash value

![](<images/Principle of Cybersecurity-image-43.png>)

因此，hash chain可以用于作为authenticator

* Spam Reduction：减少垃圾邮件，要求发送邮件之前证明自己的work (proof-of-work，work就是CPU cycles)，目的是限制邮件的发送数量（不能完全消除垃圾邮件）

![](<images/Principle of Cybersecurity-image-42.png>)

![](<images/Principle of Cybersecurity-image-44.png>)

# Reverse Engineering

* Software Reverse Engineering: basis of all software security missions

* Protocol Reverse Engineering: extract the application/network protocol, intercept the traffic

* Algorithm/model Reverse Engineering: reverse to get the source code

## Software Reverse Engineering

Converts executable file into source code

![](<images/Principle of Cybersecurity-image-30.png>)

* Source code

* Assembly code: assembly instructions+data, compiler translates source code into assembly code

* Executable file: translates assembly code into executable format

* Disassembler: <span style="color: rgb(216,57,49); background-color: inherit">converts executable files into CPU assembly instructions</span>

* Decompiler:<span style="color: rgb(216,57,49); background-color: inherit"> converts executable files to source code (therefore contains a disassembler) </span>

Software compilation is conceptually a one way function, very difficult to map back to the exactly piece of code

![](<images/Principle of Cybersecurity-image-31.png>)

## Disassembling

### Linear Disassembling

Linear disassembling: <span style="color: rgb(216,57,49); background-color: inherit">starts from the first byte in the code section of the exe file to decode each byte </span>(map one or a sequence of bytes to its corresponding assembling instruction), until the end

Linear disassembling can be trapped

![](<images/Principle of Cybersecurity-image-32.png>)

### Recursive Disassembling

Recursive disassembling<span style="color: rgb(216,57,49); background-color: inherit"> follows the program control transfers to disassemble</span>

Disadvantages:

* Cannot deal with instructions like<span style="color: rgb(216,57,49); background-color: inherit"> indirect jump</span>

* Might <span style="color: rgb(216,57,49); background-color: inherit">miss some useful codes</span>

* Can be fooled by <span style="color: rgb(216,57,49); background-color: inherit">code obfuscation </span>(control flow obfuscation)

![](<images/Principle of Cybersecurity-image-33.png>)

## Variable/Type Recovery

T<span style="color: rgb(216,57,49); background-color: inherit">he recovered assembly code lacks type and variable declaration</span>

Holistic View: From a holistic view, variable recovery tries to divide the memory space into small regions, each small region is deemed as one variable

Type Inference: Variables of different types can have the same length in memory

![](<images/Principle of Cybersecurity-image-34.png>)

## Control Flow Graph Recovery

![](<images/Principle of Cybersecurity-image-35.png>)

## Code Generation

Code Generation with pattern matching and concretize code templates

![](<images/Principle of Cybersecurity-image-36.png>)

Practical challenges (bug) during C/C++ deompilation: Variable/type recovery is still difficult for de facto commercial decompiler

## Application-Software Crack

* Serial number checking: simple `if` condition by taking the user input and a hardcoded serial number for comparison.&#x20;

  * Can use re-engineering (disassembly) to find the serial number&#x20;

  * Can write a serial patch exe to edit the serial number

* Prevention: anti-disassembly techniques, code obfuscation

# Malware

Adversaries aim to get code running on your computer that performs tasks of their choosing

* Steal personal information

* Delete files

* Click fraud

* Steal software serial number

* Use your computer as relay

Types of Malware

* Worm/Virus: active or passive propagation

* Trojan Horse: unexpected functionality

* Trapdoor/Backdoor: unauthorized access

## Worms

A <span style="color: rgb(216,57,49); background-color: inherit">self-propagating</span> program through the <span style="color: rgb(216,57,49); background-color: inherit">Internet</span>

![](<images/Principle of Cybersecurity-image-37.png>)

Its infection grows at an exponential rate, very dangerous

Repeated propagation could cause machine to lose response

## Virus

An attack that <span style="color: rgb(216,57,49); background-color: inherit">modifies programs</span> on your host

![](<images/Principle of Cybersecurity-image-38.png>)

Windows exe file format: Portable Executable (PE)

![](<images/Principle of Cybersecurity-image-39.png>)

How does a virus work?

Step 1: Modify the header

Step 2: Attach a malicious code section to PE file. The modified header will redirect the execution to malicious data section

## Trojan Horse

A malicious program that is <span style="color: rgb(216,57,49); background-color: inherit">disguised as legitimate software</span>

Differences with virus:

* Does not duplicate itself

* Can usually be controlled remotely

Trojan in Android: App Repackaging Attack

* Create a malicious code fragment

* Download popular app and then decompile

* Insert attack code fragment and distribute

## Backdoor

Secretly bypass normal authentication in a computer system. Let malicious users <span style="color: rgb(216,57,49); background-color: inherit">remotely/locally access the system without being authenticated.</span>

## Malware Detection

### Signature Detection

A signature may be a string of bits in exe. Virus might have its special signature. We can search for this signature in all files. Most popular (easiest) detection method

Advantages:

* Effective on ordinary malware

* Minimal burden for users/administrators

Disadvantages:

* Signature file can be large, <span style="color: rgb(216,57,49); background-color: inherit">making the scanning slow</span>

* Signature file <span style="color: rgb(216,57,49); background-color: inherit">must be up to date</span>

* <span style="color: rgb(216,57,49); background-color: inherit">Cannot detect viruses if no specific signature on hand</span>

* Cannot detect some advanced malware

### Ransomware Detection

Lightweight symmetric key crypto is used for encrypt victim's data (TEA, twoflish, ...)

### Dynamic Behavior Detection

Monitor system for anything unusual, virus-like, potentially malicious, usually conbine with other methods (signature detection)

How do we <span style="color: rgb(216,57,49); background-color: inherit">get the behavior of suspicious software? Isolation the execution of suspicious software:</span>

* Virtual Machine

* Sandbox

* Hardware supports

Malware might evade such detection

Advantages: chance of detecting unknown malware with no static signatures on hand

Disadvantages:  Attacker can make abnormal behavior look normal

### Malware Clustering

People have accumulated a large number of known malware samples (malware database). Many malwares are written by the same author or using the same malware toolkit

<span style="color: rgb(216,57,49); background-color: inherit">Given unknown software, we try to find whether it is similar to existing malware families </span>

Use software engineering/data mining techniques to identify the similarity of suspicious software

## Encrypted Malware

Malware writers <span style="color: rgb(216,57,49); background-color: inherit">encrypt the signature</span> to evade signature detection.

Detection:

To detect encrypted malware, we scan for the decryption code, and dump these code during runtime (since malware needs to decrypt itself before executing).

## Metamorphic Malware

A metamorphic malware <span style="color: rgb(216,57,49); background-color: inherit">mutates before infecting a new system</span>. Such a malware can evade signature detection.

Mutated malware must function the same.

A malware with the same functionality as original, but <span style="color: rgb(216,57,49); background-color: inherit">different signature</span>

# Exploitation

Software bugs can be potentially exploited. They are called vulnerabilities.

## Buffer Overflow

Buffer is a data storage area inside memory, intended to hold a pre-defined amount of data. If more data is stored/required from buffer, it tampers the adjacent memory. 篡改附近的内存内容

### Stack Frame

![](<images/Principle of Cybersecurity-image-40.png>)

Stack由一个个stack frame组成。每当调用函数时，就会在stack上push入一个新的stack frame；当函数返回时，就会pop这个stack frame。

当函数被调用时，会在stack frame上存放：返回地址、stack frame指针、局部变量。也就是说stack frame保存了函数运行所需的全部上下文信息。

Stack的内存地址是从高地址往低地址增长的。

当出现buffer overflow时，多出来的数据会继续向低地址写入，最终覆盖返回地址。也就是说，如果攻击者输入的数据太长，就会越界写入，覆盖到返回地址。

![](<images/Principle of Cybersecurity-image-41.png>)

Stack向低地址方向增长：每次调用一个新的函数，在低地址除push一个新的stack frame，因此低地址方向是top of stack

Smashing the buffer：当buffer中的元素超过预分配的内存大小，就会覆盖掉存储返回地址的内存，函数就会返回到错误的地址，比如说malicious code的地址（code injection）

![](<images/Principle of Cybersecurity-image-58.png>)

### Buffer Overflow Attack

Buffer反方向增长，因此覆盖了返回地址的内存

Buffer overflow必须存在于code中，但是不一定能被exploit，取决于被覆盖的数据能否影响控制流等

如果可以被exploit，攻击者可以inject code

攻击成功需要通过trial and error：需要猜测注入code的地址

Buffer overflow容易被unsafe C/C++ library functions引起，例如strcpy和gets（缺少boundary check）

### Buffer Overflow Defense

* Marking stack as non-executable：将stack标记为不可执行

  * W^X原则：Write XOR Execute，一块内存不可同时可写可执行

  * Problem: 一些软件确实需要在运行时生成并执行代码或需要可写的代码段，这会和 W^X 冲突。如果强制W^X，会导致这些软件无法正常运行（兼容性问题）

* Randomization: 攻击者需要知道确切地址，才能将控制流劫持到准确的内存地址，比如attack code的地址。在没有随机化的系统中，程序的内存布局是可以预测的，相同的程序、相同的版本和平台可能会有相同的内存布局。攻击者只要知道某个常见版本的地址，他们可以写出一次有效的exploit，并把它批量投放到大量机器上。

  * Diversity：使得关键的内存区域的地址在不同机器/进程之间不同、不可预测。即使攻击者掌握了某一机器上的漏洞利用方法，也无法保证对另一台机器可用

  * ASLR: arrange the positions of key data areas randomly in a process's address space

* Canary: 在stack的关键控制区域（例如返回地址）放置一个canary value，函数返回前检查这个值是否被改写。如果被改写了，说明发生了buffer overflow

  * Canary value: constant或者随机值

  ![](<images/Principle of Cybersecurity-image-59.png>)

# Obfuscation

Making<span style="color: rgb(216,57,49); background-color: inherit"> protected software look dissimilar to its original version</span>

* The problem of reverse engineering: can never completely protect an application from malicious reverse engneering

  * Given sufficient time and resources, an adversary can reverse engineer any obfuscated code (exhaustive search), but too expensive for attackers

## Layout Obfuscation

Changes or removes useful information from the code<span style="color: rgb(216,57,49); background-color: inherit"> without affecting real instructions</span>: <span style="color: rgb(216,57,49); background-color: inherit">comment stripping, identifier renaming</span>

![](<images/Principle of Cybersecurity-image-57.png>)

## Data Obfuscation

Variable <span style="color: rgb(216,57,49); background-color: inherit">splitting and merging and encoding</span>

![](<images/Principle of Cybersecurity-image-56.png>)

## Control-flow Obfuscation

Rename and data do not change the control structure of the program. Attackers can still leverage control structure as code signature (adversarial similarity analysis)

![](<images/Principle of Cybersecurity-image-45.png>)

### Instruction Insertion (Garbage code insertion)

Inserts meaningless instructions or sequences of instructions

Very popular: easy to implement, easily break down known patterns/signatures

![](<images/Principle of Cybersecurity-image-46.png>)

### Opaque Predicates

![](<images/Principle of Cybersecurity-image-47.png>)

* Value is known to the obfuscator

* Value is easy to compute during runtime

* Value difficult for the adversary to deduce

The opacity property of predicates determines the resilience of control-flow transformations

Invariant opaque predicates are easy:

![](<images/Principle of Cybersecurity-image-48.png>)

Context opaque predicates:

![](<images/Principle of Cybersecurity-image-49.png>)

Opaque Predicates based on Multi-threading: One thread puts random number>n into global data structure, another thread assigns x one of these numbers

Then conditional if (x\<n) is an opaque predicate

## Advanced Obfuscation

* VM-based Obfuscation

* Multilingual Obfuscation: 将不同范式的语言（计算模型）混合在一起，编译后会产生控制流复杂的机器码，使得machine code obscure

## Evaluation

* Potency: how much complexity

* Stealth: how well obfuscated code blends with the rest of the program

* Resilience: how difficult it is to undo obfuscation

* Cost: performance penalty caused by obfuscation

# Software Protection

## Formal Verification

Formal verification can ideally eliminate vulnerabilities. (Mathematically prove the absence of bugs.)

* Specification: what properties I would like to prove? (Sorting? Memory safety?)

* Inductive proofs: Write proofs as code, and computers will check the correctness of proof code

Impractical in general: hard in general, impossible for big things

## Type System

类型检查系统

Provide strong guarantee on well-typed programs

Does not eliminate all problems, although with such annotations we can quickly pinpoint some defects (type check is super fast)

## Fuzz Testing

Given a program <span style="color: rgb(216,57,49); background-color: inherit">simply feed random inputs to execute and and see whether it triggers errors</span>

To execute:

* We find a bug and we know how to trigger it at the same time

* Important for the attacker to control the bug

Random:

* We find many corner cases by using invalid inputs

Errors:

* <span style="color: rgb(216,57,49); background-color: inherit">Crash: memory access errors and therefore cause memory overread/overwrite vulnerabilities</span>

* <span style="color: rgb(216,57,49); background-color: inherit">Hang: system lost response</span>

* <span style="color: rgb(216,57,49); background-color: inherit">Race condition</span>

* Other errors

注意：<span style="color: inherit; background-color: rgba(255,246,122,0.8)">fuzzing用来发现可能会被攻击者利用的错误，而不是逻辑错误或者一般的代码错误 （和一般的使用断言的test case不一样！！！）</span>

![](<images/Principle of Cybersecurity-image-50.png>)

### Mutation-based fuzzing

Take well-formed or random inputs, randomly perturb (flipping bits)

Little or **<span style="color: rgb(216,57,49); background-color: inherit">no knowledge of the structure of the inputs is assumed</span>**

Anomalies are added to existing inputs

![](<images/Principle of Cybersecurity-image-51.png>)

Easy to setup and automate

<span style="color: rgb(216,57,49); background-color: inherit">Little or no input format knowledge </span>is required

<span style="color: rgb(216,57,49); background-color: inherit">May fail at the early stage, like parsing and format checking</span>

### Generation-based (Grammar-aware) fuzzing

Test cases are **<span style="color: rgb(216,57,49); background-color: inherit">generated from some description of the input format (documentation)</span>**

<span style="color: rgb(216,57,49); background-color: inherit">Pre-knowledge of protocol/format</span> should give better results than random fuzzing

* Directly generate many structured inputs

* Work together with random mutation to explore different components

**Mutation-based vs. Generation-based**

* Mutation-based fuzzer

  * Easy to setup and automate, little or no knowledge of input format required

  * Limited by <span style="color: rgb(216,57,49); background-color: inherit">initial input seeds</span>, fall for protocols with checksums and other checks

* Generation-based fuzzer

  * Completeness, theoretically can deal with complex dependencies

  * <span style="color: rgb(216,57,49); background-color: inherit">Writing generators is hard</span>, <span style="color: rgb(216,57,49); background-color: inherit">performance depends on the quality of the SPEC</span> (specifications, often not available)

### Blackbox Fuzzing

Keep generating mutated inputs and feed to the test application. Application is monitored for errors

Advantage: easy, low cost

Disadvantage: inefficient (particularly for random mutation)

* Inputs often require structures, random inputs are likely to be rejected at early stage

* Inputs that trigger an incorrect behavior is a very small fraction

Blackbox：不需要知道fuzzed software的知识

Graybox：需要部分知道fuzzed software的知识

### GrayBox Fuzzing

![](<images/Principle of Cybersecurity-image-52.png>)

Mutation-based：不需要知道inputs结构，有black box和gray box两种mode

Generation-based：需要inputs的spec，有black box和gray box两种mode，black box的效果不差

#### Code Coverage

Line Coverage:**&#x20;**&#x6D;easures how many lines of source code have been executed

Branch Coverage: measures how many branches in code have been taken (conditional jumps)

Path Coverage: measures how many paths have been taken

Code coverage helps evaluate how good a fuzzer is

#### Coverage-guided Graybox Fuzzing

Run mutated inputs and <span style="color: rgb(216,57,49); background-color: inherit">measure code coverage</span>

Search for mutants that result in coverage increase

Often use a genetic algorithm (try random mutations on test corpus and only keep mutants for further usage if coverage increases)

![](<images/Principle of Cybersecurity-image-53.png>)

### Fuzzing challenges

How to seed a fuzzer

* Seed inputs must <span style="color: inherit; background-color: rgba(255,246,122,0.8)">cover different branches</span>

* Remove duplicate seeds <span style="color: inherit; background-color: rgba(255,246,122,0.8)">covering the same branches</span>

Some branches might be hard to get passed as the probability of inputs satisfying the conditions are very small

* Manually transform/remove those branches

## Static security methods vs Dynamic security methods

Dynamic security methods

* Fuzzing: Stress the software with random/crafted input before deployment, hope to trigger bugs and fix them

In principle, it's<span style="color: rgb(216,57,49); background-color: inherit"> not guranteed </span>to fully cover the entire program.

Static analysis: Looking for defects in the source code <span style="color: rgb(216,57,49); background-color: inherit">without running it</span>

* Taint analysis

* Formal verification

* Symbolic execution

![](<images/Principle of Cybersecurity-image-54.png>)

False negative: 只能检测实际执行到的路径，如果某条路径没有在运行中触发，动态分析就无法看到，也无法发现其中的bug（ Dynamic method的问题：每次只能执行一条路径，<span style="color: inherit; background-color: rgba(255,246,122,0.8)">实际存在但是没有检测到）</span>

False positives: 静态分析不需要运行程序，而是直接分析程序的控制流图，因此可以看到所有可能路径。可能报告实际上<span style="color: rgb(216,57,49); background-color: inherit">不可能发生的错误</span>，造成False positive （Static method的问题：<span style="color: inherit; background-color: rgba(255,246,122,0.8)">实际不存在但是检测到）</span>

![](<images/Principle of Cybersecurity-image-55.png>)

![](<images/Principle of Cybersecurity-image-73.png>)

## Taint Analysis

### Taint source

Generally any untrusted or sensitive information

![](<images/Principle of Cybersecurity-image-72.png>)

To taint user data is to <span style="color: rgb(216,57,49); background-color: inherit">insert some kind of tag or label for each object of the user data</span>

The <span style="color: rgb(216,57,49); background-color: inherit">tag allows us to track the influence</span> of the tainted object along the execution of the program

### Taint propagation

![](<images/Principle of Cybersecurity-image-70.png>)

Usually, we need to define at least one taint propagation policy for each computation statement in the software.

Taint operator is transitive

（如果一个表达式或变量是tainted，那么某些语句会让tainted继续传播到其他变量）

### Taint sink

Sensitive program points: affected by critical information

* A buffer overflow bug

* A network API

* A hardware device

Sensitive program points can be defined as taint sink

### Application

* Exploit detection: detect if nontrusted data reaches a privileged location

* Perl tainted mode (a dynamic taint analysis module): check if the statement is tainted or not before execution, if tainted issue an attack alert

### Soundness vs. Completeness

![](<images/Principle of Cybersecurity-image-71.png>)

If a sound taint analysis tells you there is no vulnerability, there is no vulnerability.&#x20;

But if a sound analysis finds a vulnerability, it might be false positive 误判了没问题的

If a complete taint analysis tells you there is a vulnerability, it must be a vulnerability 可能会漏判有问题的

Taint analysis: either sound or complete, or not complete or sound

# Software Exploitation

## Heap Memory

Heap is the portion of memory where dynamically allocated memory resides (malloc, new)

Memory allocated from the heap will remain allocated until one of the following occurs

* Program terminates

* Software calls free or delete

![](<images/Principle of Cybersecurity-image-60.png>)

## Use After Free

Program frees data on the heap, but then <span style="color: rgb(216,57,49); background-color: inherit">references that memory as if it were still valid</span>

![](<images/Principle of Cybersecurity-image-61.png>)

![](<images/Principle of Cybersecurity-image-62.png>)

Use-after-free漏洞：一个不可能login的server被login

创建auth指针，后free；

auth没有被置为NULL，且仍然指向原来heap的地址

<span style="color: rgb(216,57,49); background-color: inherit">创建service对象，在heap中分配空间，且大概率复用原来auth指向的空间</span>

此时，auth指向的地址位置不为0，就有可能成功login

Prevent:&#x20;

* **<span style="color: rgb(216,57,49); background-color: inherit">Set all freed pointers to NULL. </span>**&#x54;hen no one can use them after they are freed

* Use smart pointers or other strategies

## Double Free

![](<images/Principle of Cybersecurity-image-63.png>)

Double free messes up the heap memory region

Prevention: setting freed pointers to NULL

## Format String Vulnerability

`printf` takes a format string and an arbitrary number of subsequent arguments

* %d 需要一个整数

* %s 需要一个字符串地址

* %f 需要一个浮点数

Compiler不会检查arguments和format string之间是否match

printf("%s%s%s%s") printf会打印栈上format string的next four values whatever they are

![](<images/Principle of Cybersecurity-image-64.png>)

`printf` can take a variable as an argument, treated as a format string

If an adversary can control this argument, they can direct `printf` to access that memory 如果format string不是hard coded而是用户可以控制的，那么攻击者可能就会输入恶意的format string来获取内存中的信息

%n 将打印的字符串长度写到指定地址，攻击者可以利用%n修改内存内容

Prevention: limiting the ability of adversaries to control the format string

* Hard-coded format strings-no printf(arg)

* Do not use %n

## SQL Injection

Causing undesired SQL queries to be run on your database.

![](<images/Principle of Cybersecurity-image-65.png>)

Best defense: use bound variables with prepared statements

By specifying parameters (either a ? or a named parameter like :name) you tell the database engine what to filter on. Then when you call execute the prepared statement is combined with the parameter values you specify.

The parameter values are combined with the compiled statement, not a SQL string.

More defenses:

* Check syntax of input for validity

* Have length limits on input

* Scan query string for undesirable word combinations that indicate SQL statements

* Limit database permissions

# Side Channel Attack

Three aspects to form a side channel attack

* Secret dependent program information flow

* Information flow affects physical environment

* Physical environment is exploitable by adversarial

## Timing Side Channel Attack on RSA

RSA decryption

![](<images/Principle of Cybersecurity-image-66.png>)

可通过计时来判断k的bit

## Cache Side Channel Attack

攻击者不需要权限访问受害者的程序，只需要与受害者共享同一段内存

Flush & Reload

* Flush: 攻击者把某个cache line从cache中清除

* Idle：等待victim program运行一段时间

* Reload：攻击者重新访问这块cache line，并测量访问时间

  * 快：命中cache，说明victim访问过该地址

  * 慢：未命中cache，victim没有访问

访问时间是victim program访问的信号side channel

![](<images/Principle of Cybersecurity-image-67.png>)

Very poweful in cloud computing, because different VM instances share the same cache

![](<images/Principle of Cybersecurity-image-68.png>)

左：Square-and-Multiply，密钥决定了是否执行if分支。如果k\[i]==1，就会执行一次额外的乘法，因此可以执行Timing attack

右：滑动窗口，通过读取密钥的一段窗口来优化速度，因此密钥决定了访问的内存位置table\[idx]，会导致cache side channel attack (Flush and Reload)

Stronger threat model: attacker can observe the accessed cache line

Weaker threat model: attacker不能访问cache line，但是可以通过cache的状态序列判断program的输入

常见于cloud computing: <span style="color: rgb(216,57,49); background-color: inherit">different VM instances share the same cache</span>

## Power Side Channel Attack

Attacker can get a power trace, representing a set of power consumptions across a cryptographic process

通过判断device功率序列的变化来识别输入的secret information

![](<images/Principle of Cybersecurity-image-69.png>)

# Authentication

Authentication: <span style="color: rgb(216,57,49); background-color: inherit">are you who you say you are?</span>

* Determine whether access is allowed

Authorization: <span style="color: rgb(216,57,49); background-color: inherit">are you allowed to do that?</span>

* Once you have access, what can you do

* Enforce limits on actions

Authenticate a human to a machine

* Something you know: password

* Something you have: a smart card

* Something you are: fingerprint

## Password

Passphrase:&#x20;

* longer (10-30 letters) to make brute force attacks difficult

* if well chosen, they will not be found in any phrase or quote dictionary

* Structured to be more memorable than passwords

### Storage

Password storage: 注册帐号时，储存密码的hash values而不是密码本身。如果公司储存密码的明文，一旦数据库泄漏，真实密码就会直接泄漏（内部员工，不同网站密码复用）

#### Dictonary Attack

Attacker pre-computes h(x) for all x in a dictionary of common passwords

Suppose the attacker gets access to password file containing hashed passwords

* only <span style="color: rgb(216,57,49); background-color: inherit">needs to compare hashes to the pre-computed dictionary</span>

* after one-time work of computing hashes in dictionary, actual attack is trivial

#### Salt

Hash password with salt

Choose random salt s and compute y=h(password, s) and store (s, y) in the password file

Still easy to verify salted passwordm but lots more work for the attacker (must recompute hash for each user)

Password attacks are too easy. Passwords are a big security problem

## Biometrics

May be better than passwords. But cheap and reliable biometrics are needed

Ideal Biometric:

* Universal: applies to everyone

* Distinguishing: distinguish with certainty

* Permanent: physical characteristic being measured never changes

* Collectable: easy to collect required data

Enrollment vs Recognition

Enrollment

* Subject’s biometric info put into database

* Must carefully measure the required info

* OK if <span style="color: rgb(216,57,49); background-color: inherit">slow and repeated measurement needed</span>

* Must be <span style="color: rgb(216,57,49); background-color: inherit">very precise</span>

* May be a weak point in real-world use

Recognition

* Biometric detection, when used in practice

* Must be <span style="color: rgb(216,57,49); background-color: inherit">quick and simple</span>

* Must be <span style="color: rgb(216,57,49); background-color: inherit">reasonably accurate</span>

Fraud rate vs insult rate

* Fraud: Attacker mis-authenticated as Alice

* Insult: Alice not authenticated as Alice

For any biometric, can decrease fraud or insult, but others will increase

## 2-factor Authentication

Requires any 2 out of 3 of

* Something you know

* Something you have

* Something you are

# Network Security

## DNS vulnerabilities

Normally if the server does not know a requested translation it will ask another server, recursively.

When a DNS server has <span style="color: rgb(216,57,49); background-color: inherit">received a false translation and caches it for performance optimization</span>, it is

considered poisoned, and it supplies the false data to clients.

If a DNS server is poisoned, it may return an incorrect IP address, diverting traffic to another computer, often

the attacker’s computer

## SYN flooding

The TCP 3-way handshake makes denial of service  (DoS) attacks possible

Whenever SYN packet is received, server remembers this “half-open” connection (consumes resources)

&#x20;Too many half-open connections and server running out of memory and crashing

Therefore, server can't respond to legitimate connections

## NAT

Trick to extend IP address space

Use one IP address (different port numbers) for multiple hosts, translate outside IP address

![](<images/Principle of Cybersecurity-image-74.png>)

Advantages:

* Extends IP address space

* One IP address can be shared by many users

* Make the original source addresses hidden

Disadvantages:

DoS attack is feasible

## Ping Attack (Ping flood)

Work by abusing the ping command

Ping operates by sending<span style="color: rgb(216,57,49); background-color: inherit"> ICMP echo request packets </span>to the target host and waiting for an <span style="color: rgb(216,57,49); background-color: inherit">ICMP echo reply</span>

A ping flood is a simple DoS attack where many attackers conspire to overwhelm victim with ICMP packets

## ARP Cache Poisoning

ARP used by link layer: given IP address, find corresponding MAC address

&#x20;Each host has ARP table or ARP cache

MiTM host

![](<images/Principle of Cybersecurity-image-88.png>)

![](<images/Principle of Cybersecurity-image-87.png>)

# Authorization

Authorization: are you allowed to do that?

* Restictions on actions of authenticated users

## Firewalls

![](<images/Principle of Cybersecurity-image-89.png>)

Packet filter: works at network layer

Stateful packet filter: transport layer

Application proxy: application layer

### Packet filter

![](<images/Principle of Cybersecurity-image-86.png>)

**TCP SYN Scan**

* Nmap sends SYN

* Gets SYN-ACK

* In any case, Nmap sends RESET

Only 2/3 of 3-way handshake completed.

Faster, fewer packets. May not be logged by host.

**Simple packet filter**

根据上面的packet filter ACL定义，<span style="color: rgb(216,57,49); background-color: inherit">firewall会过滤没有ACK的包</span>

simple packet filter不记录连接状态，不知道是否正在进行TCP连接

attacker可以伪造带有ACK的包（SYN+ACK），这些包可以通过open ports，也就允许了simple port scan

按理来说，应该先发SYN，然后再回复SYN+ACK，但是这里attcker直接发了SYN+ACK），只看ACK bit是否为1（ACK=0就不通过

<span style="color: rgb(216,57,49); background-color: inherit">如果server能够返回RESET，说明这个port是open的</span>

![](<images/Principle of Cybersecurity-image-83.png>)

### Stateful Packet Filter

Adds state to packet filter

Operates at transport layer

Remembers TCP connections, flag bits, ...

Advantages: keep track of ongoing connections 追踪TCP连接状态，比如在没有进行TCP连接请求时不接受SYN+ACK，因此能防止TCP ACK scan

Disadvantages: cannot see application data, slower than packet filtering

### Application Proxy

Application proxy looks at incoming application data

Verifies data is safe before letting it in

**<span style="color: rgb(216,57,49); background-color: inherit">Creates a new packet</span>** before sending it thru to internal network

Advantages:<span style="color: rgb(216,57,49); background-color: inherit"> complete view of connections and application data</span>, <span style="color: rgb(216,57,49); background-color: inherit">filter bad data at application layer</span>

Disadvantages: speed

作为一个中间人，代为检查应用层协议内容，只允许完全合法的应用层流量通过

#### Firewalk

Two phases: network discovery, actual scanning

Network discovery phase: use TTL (time to live) to find hops to firewall 通过TTL找跳数

Scanning phase: packet sent to host behind the firewall

攻击者首先探测到firewall的跳数

然后攻击者向防火墙后的目标主机发送：

* TTL刚好让包在防火墙后的一hop过期，这个包刚好能到达firewall后面的第一个server或者router（方法：发送递增TTL的包，如果在某一个hop远端节点不会回复ICMP Time Exceeded，就说明可能遇到了firewall）

* 包含特定端口的探测数据包

结果：

* 如果收到ICMP Time Exceeded，表示这个包穿过了防火墙，端口被允许

* 如果没有收到，包被防火墙丢弃

![](<images/Principle of Cybersecurity-image-85.png>)

Nmap vs Firewalk:

Nmap a firewall: 可以看到firewall本身有哪些端口在监听，不能告诉你firewall后面有什么，也不能推断ACL规则

Firewalk：不直接扫描端口，而是

* 用TTL技巧判断哪些包穿过了防火墙

* 推测防火墙允许哪些端口/协议通过

* 推断内部网络结构topology

![](<images/Principle of Cybersecurity-image-84.png>)

Firewalk无法攻破application proxy，<span style="color: rgb(216,57,49); background-color: inherit">因为proxy会创造一个新的packet，销毁原来的TTL</span>

## Intrusion Detection System

Detect attacks in progress

Look for unusual or suspicious activity

Intrusion detection approaches

* Signature-based IDS (template <span style="color: rgb(216,57,49); background-color: inherit">pre-defined</span>)

* Anomaly-based IDS (metrics <span style="color: rgb(216,57,49); background-color: inherit">dynamically adjusted</span>)

Intrusion detection architectures

* Host-based IDS

* Network-based IDS

Host-based: 针对及其本地的检测

![](<images/Principle of Cybersecurity-image-82.png>)

Network-based: 针对网络环境的检测

![](<images/Principle of Cybersecurity-image-81.png>)

### Signature Detection

login问题：M秒内失败N次，IDS可以利用这个规则作为signature

如果M秒内失败超过N次，IDS会警告攻击

但是如果攻击者知道了这个signature，他会尝试每M秒登录N-1次。因此signature detection能够降低attacker的速度，但是不能阻止attacker

Signature detection不只是匹配完全一样的攻击特征，系统需要识别接近攻击的特征，而不仅仅是完美匹配

如果在大约M秒内出现大约N次登录尝试，系统应该发出警告可能是password cracking，但是要考虑“大约”的容忍范围，模糊匹配

模糊匹配：可以考虑使用统计分析、启发式、机器学习方法实现

Advantages

* simple

* detect known attacks

* know which attack at time of detection

* efficient

Disadvantages

* signature file must be kept up to date

* number of signatures may become large

* can only detect known attacks, variation on known attack may not be detected

### Anomaly Detection

Anomaly detection systems look for<span style="color: rgb(216,57,49); background-color: inherit"> unusual or abnormal behavior</span>

Mean defines normal

Variance gives distance from normal to abnormal

Abnormal:

* Indicates there may be an attack

* Might not be any specific info about attack

* In contrast, signature detection is very specific

![](<images/Principle of Cybersecurity-image-80.png>)

![](<images/Principle of Cybersecurity-image-79.png>)

![](<images/Principle of Cybersecurity-image-78.png>)

Attackers can <span style="color: rgb(216,57,49); background-color: inherit">move slowly and gradually convince the IDS</span>

At the end of the day, IDS (MTD) is not silver bullet.

Attacker may win simply by “going slow”

Advantages: chance of <span style="color: rgb(216,57,49); background-color: inherit">detecting unknown attacks</span>

Disadvantages:

* Reliability is unclear

* May be subject to attack

* <span style="color: rgb(216,57,49); background-color: inherit">Lacks specific information on possible attack</span>

# Protocol

## Authentication Protocols

### 明文密码验证

![](<images/Principle of Cybersecurity-image-77.png>)

可重放

![](<images/Principle of Cybersecurity-image-75.png>)

### Nonce-防重放

防重放的方式：nonce，保证消息的freshness，不同session必须不同

![](<images/Principle of Cybersecurity-image-76.png>)

Alice必须对R做某种不可伪造的运算，如hash

Bob验证，新鲜性保证不是重放

### 对称密钥认证

Alice和Bob共享K

![](<images/Principle of Cybersecurity-image-101.png>)

Bob解密，若正确，则Alice通过认证

缺点：只能单向认证（Bob认证Alice，Alice无法认证Bob）

### Mutual Authentication

![](<images/Principle of Cybersecurity-image-99.png>)

问题：Alice能够认证Bob（解密得到的R和自己发送的R一致），Bob无法认证Alice，因此需要发送两次nonce

![](<images/Principle of Cybersecurity-image-100.png>)

问题：可能出现reflect attack。攻击者可以通过开启第二个会话的方式，获取K和R\_B的加密结果，然后传递到第一个会话中，冒充Alice

![](<images/Principle of Cybersecurity-image-103.png>)

**<span style="color: rgb(216,57,49); background-color: inherit">正确做法：加上身份信息</span>**

![](<images/Principle of Cybersecurity-image-104.png>)

### 公钥认证

不能用一套公钥既加密又解密，要用两套key pairs

* one key pair for<span style="color: rgb(216,57,49); background-color: inherit"> encryption/decryption and signing/verifying signatures</span>

* one key pair for <span style="color: rgb(216,57,49); background-color: inherit">authentication</span>

### Session key

A symmetric key for current session

![](<images/Principle of Cybersecurity-image-98.png>)

问题：没有mutual authentication，Alice被认证，Bob没有被认证，攻击者可以冒充Bob

![](<images/Principle of Cybersecurity-image-93.png>)

问题：session key暴露给MiTM，攻击者可以取得R K

![](<images/Principle of Cybersecurity-image-95.png>)

问题：可能带来MiTM attack

![](<images/Principle of Cybersecurity-image-97.png>)

**<span style="color: rgb(216,57,49); background-color: inherit">正确做法：先用对方的公钥加密，再用自己的私钥签名（密钥包裹公钥）</span>**

![](<images/Principle of Cybersecurity-image-102.png>)

### Mutual Authentication+PFS

Perfect forward secrecy: Trudy cannot later decrypt recorded ciphertext

* Alice cannot use K to encrypt

* Instead they must use a<span style="color: rgb(216,57,49); background-color: inherit"> session key Ks and forget it after it&#39;s used</span>

#### Naive Session Key Protocol

![](<images/Principle of Cybersecurity-image-94.png>)

不能做到PFS：Trudy记录下E(Ks, K)，如果Trudy获得K，那么就可以获得Ks，从而破译message

#### Diffie-Hellman

![](<images/Principle of Cybersecurity-image-96.png>)

* 先用Diffie-Hellman中的g p a b协商，获得<span style="color: rgb(216,57,49); background-color: inherit">session key: g^(ab) mod p</span>

* a与b在session结束后销毁

* 使用mutual authentication保护DH参数，防止MiTM

![](<images/Principle of Cybersecurity-image-91.png>)

结果：

* 认证成功

* Session key不会泄漏

* PFS，即使攻击者获得了长期密钥也无法破译过去会话内容

### Timestamps

Timestamp可用于防止replay attack

clocks not same and/or network delays, so must allow for clock skew

During the time-skew window, there is still room for replay attack

![](<images/Principle of Cybersecurity-image-90.png>)

问题：Trudy可以窃取K，可以用Alice的公钥获取内层信息，然后自己签名后发给Bob。Bob会正常回给Trudy消息，那么消息就能够解密获得K。

正确做法：

![](<images/Principle of Cybersecurity-image-92.png>)

### Summary

* 这条消息是谁发的（身份签名）

* 这条消息是新的（nonce 或 timestamp）

* session key / 认证内容属于谁（receiver binding）

## SSH

* Creates a “secure tunnel”

* Insecure command sent thru SSH “tunnel” are then secure

* SSH is a relatively simple protocol

SSH authentication: Digital certificate

* Create a key pair (with ssh-keygen)

* &#x20;Ask the CA to sign the pub key

* Start to use the newly created certificate to use the certificate mode

用certificate验证：certificate中有发送者的身份信息以及公钥，接受者可以用公钥解开S\_B

![](<images/Principle of Cybersecurity-image-114.png>)

## SSL

![](<images/Principle of Cybersecurity-image-113.png>)

# Blockchain

![](<images/Principle of Cybersecurity-image-111.png>)

## Motivation

传统Ledger攻击

* 篡改交易：伪造欠款信息等

* 重复交易：同一笔交易复制两次，签名依旧合法

* 超额支付：交易者余额不够，写上透支交易信息

* 中心化：单一机构维护ledger，造成trust问题

## Solution

* 引入数字签名：每个交易必须由付款方使用密钥签名

* 添加unique transaction ID `[1, Bob woes Alice $10`，阻止复制同一笔交易

* 引入预存资金Prepayment，避免overdraw：每个交易者一开始必须deposit到ledger；任何交易如果导致余额<0，直接invalid

* Ledger本身就是currency

  * Ledger会记录所有余额

* Distributed Ledger

  * 每个人都能复制ledger

  * 每个人都能广播新交易

  * 每个人都能尝试添加新block

可能会有多个版本的ledger并存，需要办法决定谁的ledger是正确的

## Proof of Work

![](<images/Principle of Cybersecurity-image-112.png>)

Work：hash次数

Hash输出随机->需要找到前n个bits为0，需要2^n次尝试

PoW目的：

* 防止作弊和攻击，因为篡改历史需要大量算力

* 让所有人达成共识“哪个链的work最多，哪个链最有效”

### Block

一个block包含：交易列表B，前一个block的hash，nonce R（由矿工计算出来）

![](<images/Principle of Cybersecurity-image-110.png>)

矿工目标：找到R，使得h(Y, B, R)<2^n

* Y：上一个区块的hash

* B：当前区块，矿工从transaction pending pool中随便取一些transaction条目

* R：随机数，是矿工要求解的目标

* n：实际上是N-n，N是hash函数产生的总位数

为什么PoW能够得到奖励：由比特币协议规定，谁先得到valid block，谁就能获得新创造的币

矿工愿意消耗算力的原因：block奖励+transaction fee

不同矿工可能产生多个chain，谁的chain最长，谁就胜出，其他chain被丢弃（更多work，更可信，全网采用）

### Double Spending Attack

攻击者Trudy想把同一笔钱花两次

步骤：

1. 给商家单独发送一个block B包含Trudy和商家的交易信息\[Trudy pays Alice 200]\_Trudy

2. 不广播给全网，此时全网仍在挖另一个版本的chain

3. Alice暂时相信她收到了钱

4. 如果Trudy挖到了更长的chain，她就可以篡改transaction历史，把100块钱给自己（白票了Alice）

5. 无人知道block B的存在

因此为了完成double spending attack，Trudy必须和全网竞争挖链，一旦落后，他的攻击就会失效

From users' perspective:

* <span style="color: rgb(216,57,49); background-color: inherit">最新block中的交易并不完全可信</span>，可能出现double spending attack

* 但是，更多的block出现，transaction valid的可能性就更高

因此wait until a few more (2-3) blocks are added before accepting a transaction

### 51% Attack

攻击者必须拥有超过全网50%的算力，才能让自己的链持续更快增长

![](<images/Principle of Cybersecurity-image-109.png>)

### Summary

1. New trasactions broadcast

2. Miners collect transactions into blocks

3. Miners race to find valid block hash

4. When miner finds hash, broadcast it

5. Block accepted if all transactions signed, no overdraft and block hash valid

6. New block extends blockchain (miners use hash of new block in the next block)

## Bitcoin

On average, 1 proof (a block) will be found every 10 minutes

* Transaction fees

* Transaction delay: transaction needs to wait for blocks (several to be safe), each block is 10 minutes

# Smart Contract

## Non-determinism

### Transaction pending pool

Each transaction waits in the transaction pending pool, until it gets picked and executed by a miner

Miners are free to include any transactions into the New BLOCK in any order 矿工可以自由选择要处理的交易和顺序

### External Contract Call

External contract可以调用当前contract

External contract call is another source of non-determinism, since callee behavior is unpredictable

### Block and Transaction State Dependency

block.timestamp

The state of transaction is another source of nondeterminism, since the system properties can be manipulated by miners.

## Common Attacks

### DAO

调用外部合约前没有更新状态，外部合约可再次执行withdraw()

![](<images/Principle of Cybersecurity-image-108.png>)

调用外部合约转钱，在转钱之后再更新余额。在改余额之前，对方就可以再来一次

```javascript
contract Attacker {
    Bank bank;

    function attack() public {
        bank.withdraw();   // 第一次取钱
    }

    // fallback：一旦收到钱就再次调用 withdraw
    function () external payable {
        if (address(bank).balance > 0) {
            bank.withdraw();   // 在 Bank 还没来得及把余额清零时，再次取钱
        }
    }
}
```

攻击者先往bank里充一点钱，balances\[attacker]=10

调用attack，第一次进入withdraw()

* amount=10

* attack.fallback，转10

fallback被触发，在同一笔交易中再次调用withdraw()，此时bank记录的balance\[attacker]还是10，继续转10

如此循环，直到back里的钱被掏空，最后才会执行一次balance\[msg.sender]=0，但是钱已经不见了

### TOD

每笔交易会先进入pending pool，由矿工挑选，按任意顺序打包进区块

矿工可调整交易顺序。如果合约依赖前一个交易的结果，攻击者可以抢跑front-running

### Block State Dependence Attack

使用系统参数作为随机种子

block.timestamp

block.number

blockhash

矿工对于这些值有一定调节空间，可以微调这些参数，让特定条件不成立

### Unexpected Revert Attack

![](<images/Principle of Cybersecurity-image-106.png>)

send返回一个布尔值，代表转账是否成功

require：只要有一个地址的转账失败，整笔交易回滚，意味着所有人都拿不到退款

### Ownership Transfer

![](<images/Principle of Cybersecurity-image-107.png>)

### Functionality Delegation

![](<images/Principle of Cybersecurity-image-105.png>)

