初始化的过程,主要完成的工作是在容器中建立 BeanDefinition 数据映射,并没有看到容器对Bean依赖关系进行注入

假设当前IoC容器已经载入用户定义的Bean信息,依赖注入主要发生在两个阶段
- 正常情况下,由用户第一次向 IoC 容器索要 bean 时触发
- 可在 `BeanDefinition` 信息中通过控制 `lazy-init` 属性
![](https://upload-images.jianshu.io/upload_images/4685968-61440d86719257a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
来让容器完成对Bean的预实例化;
即在初始化的过程中就完成某些Bean的依赖注入的过程.

# 1 getBean触发的依赖注入
`BeanFactory` 是最原始的 ioc 容器，有以下方法 
1.getBean
2.判断是否有 Bean，containsBean
3.判断是否单例 isSingleton

BeanFactory 只对 ioc 容器最基本的行为作了定义,不关心 Bean 是怎样定义和加载的;
如果我们想要知道一个工厂具体产生对象的过程,则要看这个接口的实现类.

在基本的容器接口 `BeanFactory` 中;
有一个 `getBean `接口,这个接口的实现就是触发依赖注入发生的地方.
为进一步了解该依赖注入的过程,我们从 `DefaultListableBeanFactory `的基类` AbstractBeanFactory `入手去看看`getBean`的实现

>这里是对 BeanFactory 接口的实现,比如getBean接口

```
	public <T> T getBean(String name, Class<T> requiredType, Object... args) throws BeansException {
        // 这些 getBean 接口最终都是通过调用 doGetBean 实现
		return doGetBean(name, requiredType, args, false);
	}
```
![](https://upload-images.jianshu.io/upload_images/4685968-9fee95ac391dc178.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```

    // 实际取得 Bean 的地方,即触发依赖注入
	@SuppressWarnings("unchecked")
	protected <T> T doGetBean(final String name, final Class<T> requiredType, final Object[] args, boolean typeCheckOnly)
			throws BeansException {

		final String beanName = transformedBeanName(name);
		Object bean;

        //急切检查单例模式缓存手动注册的单例
        //先从缓存中取得Bean,处理那些已经被创建过的单例Bean,这种Bean不要重复创建
		Object sharedInstance = getSingleton(beanName);
```

顺道看看getSingleton()的实现
![DefaultSingletonBeanRegistry # getSingleton(String beanName)](https://upload-images.jianshu.io/upload_images/4685968-2374a16031b2878b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![方法描述](https://upload-images.jianshu.io/upload_images/4685968-f34d70f4d10bb010.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
protected Object getSingleton(String beanName, boolean allowEarlyReference) {
		Object singletonObject = this.singletonObjects.get(beanName);
		if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
			synchronized (this.singletonObjects) {
				singletonObject = this.earlySingletonObjects.get(beanName);
				if (singletonObject == null && allowEarlyReference) {
					ObjectFactory<?> singletonFactory = this.singletonFactories.get(beanName);
					if (singletonFactory != null) {
						singletonObject = singletonFactory.getObject();
						this.earlySingletonObjects.put(beanName, singletonObject);
						this.singletonFactories.remove(beanName);
					}
				}
			}
		}
		return (singletonObject != NULL_OBJECT ? singletonObject : null);
	}
```
回过头继续看工厂实现
```
		if (sharedInstance != null && args == null) {
		    
            ...

            //以取得 FactoryBean 的相关处理及生产结果
			bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
		}
```
来看看该 getObjectForBeanInstance 方法的实现,和FactoryBean有何关系呢
![AbstractBeanFactory # getObjectForBeanInstance(Object beanInstance, String name,String beanName, RootBeanDefinition mbd)](https://upload-images.jianshu.io/upload_images/4685968-941dffd0a41e6ab8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
	protected Object getObjectForBeanInstance(Object beanInstance, String name, String beanName, RootBeanDefinition mbd) {

		// Don't let calling code try to dereference the factory if the bean isn't a factory.
		if (BeanFactoryUtils.isFactoryDereference(name) && !(beanInstance instanceof FactoryBean)) {
			throw new BeanIsNotAFactoryException(transformedBeanName(name), beanInstance.getClass());
		}

		// Now we have the bean instance, which may be a normal bean or a FactoryBean.
		// If it's a FactoryBean, we use it to create a bean instance, unless the
		// caller actually wants a reference to the factory.
		if (!(beanInstance instanceof FactoryBean) || BeanFactoryUtils.isFactoryDereference(name)) {
			return beanInstance;
		}

		Object object = null;
		if (mbd == null) {
			object = getCachedObjectForFactoryBean(beanName);
		}
		if (object == null) {
			// Return bean instance from factory.
			FactoryBean<?> factory = (FactoryBean<?>) beanInstance;
			// Caches object obtained from FactoryBean if it is a singleton.
			if (mbd == null && containsBeanDefinition(beanName)) {
				mbd = getMergedLocalBeanDefinition(beanName);
			}
			boolean synthetic = (mbd != null && mbd.isSynthetic());
			object = getObjectFromFactoryBean(factory, beanName, !synthetic);
		}
		return object;
	}
```
继续回过头
```

		else {
			// 若早已创建该 bean 实例则会失败进入到此
			// 假设处在引用循环依赖中
			if (isPrototypeCurrentlyInCreation(beanName)) {
				throw new BeanCurrentlyInCreationException(beanName);
			}

            // 检查 bean 定义是否存在于该工厂
			BeanFactory parentBeanFactory = getParentBeanFactory();
			if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
				// 没有找到,即不存在 -> 检查父类
				String nameToLookup = originalBeanName(name);
				if (args != null) {
					// 有更精确的参数 -> 委托给父类
					return (T) parentBeanFactory.getBean(nameToLookup, args);
				}
				else {
					// 无参数 -> 委托给标准的 getBean 方法
					return parentBeanFactory.getBean(nameToLookup, requiredType);
				}
			}

			if (!typeCheckOnly) {
				markBeanAsCreated(beanName);
			}

			try {
                //根据 Bean 名取得 BeanDefinition  
				final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
				checkMergedBeanDefinition(mbd, beanName, args);

				
                //递归获得当前 Bean 依赖的所有Bean,确保它们的初始化
				String[] dependsOn = mbd.getDependsOn();
				if (dependsOn != null) {
					for (String dep : dependsOn) {
						if (isDependent(beanName, dep)) {
							throw new BeanCreationException(mbd.getResourceDescription(), beanName,
									"Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
						}
						registerDependentBean(dep, beanName);
						getBean(dep);
					}
				}
  
                // 创建 singleton bean 的地方
				if (mbd.isSingleton()) {
					sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {
						@Override
						public Object getObject() throws BeansException {
							try {
                                // 调用 createBean 创建单例 bean实例
								return createBean(beanName, mbd, args);
							}
							catch (BeansException ex) {
								// Explicitly remove instance from singleton cache: It might have been put there
								// eagerly by the creation process, to allow for circular reference resolution.
								// Also remove any beans that received a temporary reference to the bean.
								destroySingleton(beanName);
								throw ex;
							}
						}
					});
					bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
				}

                // 创建 prototype bean 的地方
				else if (mbd.isPrototype()) {
					// It's a prototype -> create a ne w instance.
					Object prototypeInstance = null;
					try {
						beforePrototypeCreation(beanName);
						prototypeInstance = createBean(beanName, mbd, args);
					}
					finally {
						afterPrototypeCreation(beanName);
					}
					bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
				}

				else {
					String scopeName = mbd.getScope();
					final Scope scope = this.scopes.get(scopeName);
					if (scope == null) {
						throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
					}
					try {
						Object scopedInstance = scope.get(beanName, new ObjectFactory<Object>() {
							@Override
							public Object getObject() throws BeansException {
								beforePrototypeCreation(beanName);
								try {
									return createBean(beanName, mbd, args);
								}
								finally {
									afterPrototypeCreation(beanName);
								}
							}
						});
						bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
					}
					catch (IllegalStateException ex) {
						throw new BeanCreationException(beanName,
								"Scope '" + scopeName + "' is not active for the current thread; consider " +
								"defining a scoped proxy for this bean if you intend to refer to it from a singleton",
								ex);
					}
				}
			}
			catch (BeansException ex) {
				cleanupAfterBeanCreationFailure(beanName);
				throw ex;
			}
		}

		// Check if required type matches the type of the actual bean instance.
        // 这里对创建的Bean进行类型检查,如果没有问题,就返回这个新创建的Bean,这个Bean已经是包含了依赖关系的Bean
		if (requiredType != null && bean != null && !requiredType.isAssignableFrom(bean.getClass())) {
			try {
				return getTypeConverter().convertIfNecessary(bean, requiredType);
			}
			catch (TypeMismatchException ex) {
				if (logger.isDebugEnabled()) {
					logger.debug("Failed to convert bean '" + name + "' to required type '" +
							ClassUtils.getQualifiedName(requiredType) + "'", ex);
				}
				throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
			}
		}
		return (T) bean;
	}
```

依赖注入的发生是在容器中的 `BeanDefinition` 数据已经建立好的前提下进行的.


# 2 依赖注入过程
![依赖注入的过程](http://upload-images.jianshu.io/upload_images/4685968-474abfacb196d345.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  
getBean() 是依赖注入的起点;
之后会调用`AbstractAutowireCapableBeanFactory`中的`createBean`来生产需要的Bean;
还对Bean初始化进行了处理,比如实现了在BeanDefinition中的init-method属性定义,Bean后置处理器等.

来看看createBean
```
	@Override 
	protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) throws BeanCreationException {
	    ...
		RootBeanDefinition mbdToUse = mbd;

		// Make sure bean class is actually resolved at this point, and
		// clone the bean definition in case of a dynamically resolved Class
		// which cannot be stored in the shared merged bean definition.
        // 判断需要创建的 Bean 是否可被实例化,该类是否可通过类加载器来载入
		Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
		if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
			mbdToUse = new RootBeanDefinition(mbd);
			mbdToUse.setBeanClass(resolvedClass);
		}

		// Prepare method overrides.
		try {
			mbdToUse.prepareMethodOverrides();
		}
	    ...
		try {			
            //给 BeanPostProcessor一个机会返回的是一个Proxy代理而不是目标 bean 的实例
			Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
			if (bean != null) {
				return bean;
			}
		}
		...
		try {
			Object beanInstance = doCreateBean(beanName, mbdToUse, args);
			...
			return beanInstance;
		}
		...
	}
```
### doCreateBean 源码解析
接着到 doCreateBean 中去看看Bean是怎样生成的
```
    protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final Object[] args) {
		// Instantiate the bean.
        //用来持有创建出来的Bean对象
		BeanWrapper instanceWrapper = null;
                //如果是单例,则先把缓存中的同名Bean清除
		if (mbd.isSingleton()) {
			instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
		}
                //这里是创建Bean的地方,由createBeanInstance来完成
		if (instanceWrapper == null) {
                       //根据指定bean使用对应的策略创建新的实例,如:工厂方法,构造函数自动注入,简单初始化
			instanceWrapper =  createBeanInstance(beanName, mbd, args);
		}
		final Object bean = (instanceWrapper != null ? instanceWrapper.getWrappedInstance() : null);
		Class<?> beanType = (instanceWrapper != null ? instanceWrapper.getWrappedClass() : null);

		// Allow post-processors to modify the merged bean definition.
		synchronized (mbd.postProcessingLock) {
			if (!mbd.postProcessed) {
				applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
				mbd.postProcessed = true;
			}
		}

		// Eagerly cache singletons to be able to resolve circular references
		// even when triggered by lifecycle interfaces like BeanFactoryAware.
                //是否需要提前曝光:单例&允许循环依赖&当前bean正在创建中,检测循环依赖
		boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
				isSingletonCurrentlyInCreation(beanName));
		if (earlySingletonExposure) {
			if (logger.isDebugEnabled()) {
				logger.debug("Eagerly caching bean '" + beanName +
						"' to allow for resolving potential circular references");
			}
                       //为避免后期循环依赖,可以在bean初始化完成前将创建实例的ObjectFactory加入工厂
			addSingletonFactory(beanName, new ObjectFactory<Object>() {
				@Override
				public Object getObject() throws BeansException {
                                        //对bean再次依赖引用,主要应用SMartInstantialiationAware BeanPostProcessor,
                                       //其中我们熟知的AOP就是在这里将advice动态织入bean中,若无则直接返回bean,不做任何处理
					return getEarlyBeanReference(beanName, mbd, bean);
				}
			});
		}

		// Initialize the bean instance.
                //这里是对Bean的初始化,依赖注入往往在这里发生,这个exposedObject在初始化处理完后悔返回作为依赖注入完成后的Bean
		Object exposedObject = bean;
		try {
                       //对bean进行填充,将各个属性值注入,其中可能存在依赖于其他bean的属性,则会递归初始化依赖bean
			populateBean(beanName, mbd, instanceWrapper);
			if (exposedObject != null) {
                                //调用初始化方法,比如init-method
				exposedObject = initializeBean(beanName, exposedObject, mbd);
			}
		}
		catch (Throwable ex) {
			if (ex instanceof BeanCreationException && beanName.equals(((BeanCreationException) ex).getBeanName())) {
				throw (BeanCreationException) ex;
			}
			else {
				throw new BeanCreationException(mbd.getResourceDescription(), beanName, "Initialization of bean failed", ex);
			}
		}

		if (earlySingletonExposure) {
			Object earlySingletonReference = getSingleton(beanName, false);
                        // earlySingletonReference 只有在检测到有循环依赖的情况下才会非空
			if (earlySingletonReference != null) {
				if (exposedObject == bean) {
                                        //如果exposedObject 没有在初始化方法中被改变,也就是没有被增强
					exposedObject = earlySingletonReference;
				}
				else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
					String[] dependentBeans = getDependentBeans(beanName);
					Set<String> actualDependentBeans = new LinkedHashSet<String>(dependentBeans.length);
					for (String dependentBean : dependentBeans) {
                                               //检测依赖
						if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
							actualDependentBeans.add(dependentBean);
						}
					}
                                        //因为bean创建后其所依赖的bean一定是已经创建的,actualDependentBeans非空则表示当前bean创建后其依赖的bean却没有全部创建完,也就是说存在循环依赖
					if (!actualDependentBeans.isEmpty()) {
						throw new BeanCurrentlyInCreationException(beanName,
								"Bean with name '" + beanName + "' has been injected into other beans [" +
								StringUtils.collectionToCommaDelimitedString(actualDependentBeans) +
								"] in its raw version as part of a circular reference, but has eventually been " +
								"wrapped. This means that said other beans do not use the final version of the " +
								"bean. This is often the result of over-eager type matching - consider using " +
								"'getBeanNamesOfType' with the 'allowEagerInit' flag turned off, for example.");
					}
				}
			}
		}
	       // Register bean as disposable.
		try {
                        //根据scope注册bean
			registerDisposableBeanIfNecessary(beanName, bean, mbd);
		}
		catch (BeanDefinitionValidationException ex) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName, "Invalid destruction signature", ex);
		}

		return exposedObject;
	}
```

## 小结
依赖注入其实包括两个主要过程
- 生产 Bean 所包含的Java对象
- Bean 对象生成之后,把这些 Bean 对象的依赖关系设置好

我们从上可以看到与依赖注入关系特别密切的方法
 - `createBeanInstance` 
生成Bean包含的Java对象
- `populateBean`.
处理对各种Bean对象的属性进行处理的过程（即依赖关系处理的过程）

###  createBeanInstance 源码解析
 ![方法描述](https://upload-images.jianshu.io/upload_images/4685968-3fe67a36af125c99.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
	protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, Object[] args) {
        // 确认需要创建的Bean实例的类可以实例化
		Class<?> beanClass = resolveBeanClass(mbd, beanName);

		if (beanClass != null && !Modifier.isPublic(beanClass.getModifiers()) && !mbd.isNonPublicAccessAllowed()) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName,
					"Bean class isn't public, and non-public access not allowed: " + beanClass.getName());
		}

		Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
		if (instanceSupplier != null) {
			return obtainFromSupplier(instanceSupplier, beanName);
		}

        //若工厂方法非空,则使用工厂方法策略对Bean进行实例化
		if (mbd.getFactoryMethodName() != null)  {
			return instantiateUsingFactoryMethod(beanName, mbd, args);
		}

		// Shortcut when re-creating the same bean...
		boolean resolved = false;
		boolean autowireNecessary = false;
		if (args == null) {
			synchronized (mbd.constructorArgumentLock) {
                //一个类有多个构造函数,每个构造函数都有不同的参数,所以调用前需要先根据参数锁定构造函数或对应的工厂方法
				if (mbd.resolvedConstructorOrFactoryMethod != null) {
					resolved = true;
					autowireNecessary = mbd.constructorArgumentsResolved;
				}
			}
		}
                //如果已经解析过则使用解析好的构造函数方法不需要再次锁定
		if (resolved) {
			if (autowireNecessary) {
                                //构造函数自动注入
				return autowireConstructor(beanName, mbd, null, null);
			}
			else {
                               //使用默认构造函数构造
				return instantiateBean(beanName, mbd);
			}
		}

                 // 使用构造函数对Bean进行实例化
		Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
		if (ctors != null ||
				mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_CONSTRUCTOR ||
				mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args))  {
			return autowireConstructor(beanName, mbd, ctors, args);
		}

		// No special handling: simply use no-arg constructor.
               //使用默认的构造函数对Bean进行实例化
		return instantiateBean(beanName, mbd);
	}

        //最常见的实例化过程instantiateBean
	protected BeanWrapper instantiateBean(final String beanName, final RootBeanDefinition mbd) {
                 //使用默认的实例化策略对Bean进行实例化,默认的实例化策略是
       //CglibSubclassingInstantiationStrategy,也就是使用CGLIB实例化Bean 
		try {
			Object beanInstance;
			final BeanFactory parent = this;
			if (System.getSecurityManager() != null) {
				beanInstance = AccessController.doPrivileged(new PrivilegedAction<Object>() {
					@Override
					public Object run() {
						return getInstantiationStrategy().instantiate(mbd, beanName, parent);
					}
				}, getAccessControlContext());
			}
			else {
				beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, parent);
			}
			BeanWrapper bw = new BeanWrapperImpl(beanInstance);
			initBeanWrapper(bw);
			return bw;
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, "Instantiation of bean failed", ex);
		}
	}
```
这里使用了CGLIB对Bean进行实例化

在Spring AOP中也使用CGLIB对Java的字节码进行增强.
## 使用CGLIB来生成Bean对象
需要看一下`SimpleInstantiationStrategy`类;
它是 Spring 用来生成Bean对象的默认类;
它提供了两种实例化Bean对象的方法
- BeanUtils,使用Java原生的反射功能
- CGLIB

```
public class SimpleInstantiationStrategy implements InstantiationStrategy {
    @Override
	public Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner) {
		// Don't override the class with CGLIB if no overrides.
		if (bd.getMethodOverrides().isEmpty()) {
            //这里取得指定的构造器或者生成对象的工厂方法来对Bean进行实例化
			Constructor<?> constructorToUse;
			synchronized (bd.constructorArgumentLock) {
				constructorToUse = (Constructor<?>) bd.resolvedConstructorOrFactoryMethod;
				if (constructorToUse == null) {
					final Class<?> clazz = bd.getBeanClass();
					if (clazz.isInterface()) {
						throw new BeanInstantiationException(clazz, "Specified class is an interface");
					}
					try {
						if (System.getSecurityManager() != null) {
							constructorToUse = AccessController.doPrivileged(new PrivilegedExceptionAction<Constructor<?>>() {
								@Override
								public Constructor<?> run() throws Exception {
									return clazz.getDeclaredConstructor((Class[]) null);
								}
							});
						}
						else {
							constructorToUse =	clazz.getDeclaredConstructor((Class[]) null);
						}
						bd.resolvedConstructorOrFactoryMethod = constructorToUse;
					}
					catch (Throwable ex) {
						throw new BeanInstantiationException(clazz, "No default constructor found", ex);
					}
				}
			}
            //通过BeanUtils进行实例化，这个BeanUtils的实例化通过Constructor来实例化Bean,在BeanUtils中可以看到具体的调用ctor.newInstance(args)
			return BeanUtils.instantiateClass(constructorToUse);
		}
		else {		
            // 使用CGLIB来实例化对象
			return instantiateWithMethodInjection(bd, beanName, owner);
		}
	}
}
```

# 4 Bean之间依赖关系的处理
依赖关系处理的入口是前面提到的`populateBean`方法;
由其涉及面广,仅简要介绍依赖关系处理的流程:
在populateBean方法中
- 首先取得在`BeanDefinition`中设置的`property`值,然后开始依赖注入的过程
- 首先处理`Autowire`的注入,可以by Name/Type,之后对属性进行注入
- 接着需要对Bean Reference进行解析
在对ManageList、ManageSet、ManageMap等进行解析完之后，就已经为依赖注入准备好了条件;
这是真正把Bean对象设置到它所依赖的另一个Bean属性中去的地方.
- 依赖注入发生在BeanWrapper的setPropertyValues中
具体的完成却是在BeanWrapper的子类BeanWrapperImpl中实现;
它会完成Bean的属性值的注入，其中包括对Array的注入、对List等集合类以及对非集合类的域进行注入

经过一系列的注入，这样就完成了对各种Bean属性的依赖注入过程

在Bean的创建和对象依赖注入的过程中，需要依据`BeanDefinition`中的信息来递归地完成依赖注入

从前面的几个递归过程中可以看到，这些递归都是以`getBean`为入口
- 一个递归是在上下文中查找需要的Bean和创建Bean的递归调用
- 另一个递归是在依赖注入时，通过递归调用容器的getBean方法，得到当前Bean的依赖Bean，同时也触发对依赖Bean的创建和注入。

在对Bean的属性进行依赖注入时，解析也是一个递归的过程
根据依赖关系，层层完成Bean的创建和注入，直到最后完成当前Bean的创建
有了这个顶层Bean的创建和对它属性依赖注入的完成，意味着和当前Bean相关的整个依赖链的注入也就完成了

在Bean创建和依赖注入完成后,在容器中建立起一系列依靠依赖关系联系起来的Bean，这个Bean已经不再是简单的Java对象了;
该Bean系列以及Bean之间的依赖关系建立完成之后，通过IoC的相关接口方法，就可以非常方便地供上层应用使用了。

# 5 lazy-init属性和预实例化
在前面的`refresh`中，可看到调用了`finishBeanFactoryInitialization`来对配置了`lazy-init`的Bean进行处理
其实在这个方法中,封装了对`lazy-init`属性的处理,实际的处理是在`DefaultListableBeanFactory`这个基本容器的`preInstantiateSingleton`方法中完成的
该方法对单例Bean完成预实例化，这个预实例化的完成巧妙地委托给了容器来实现
如果需要预实例化,那么就直接在这里采用`getBean`去触发依赖注入
