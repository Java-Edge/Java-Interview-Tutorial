# AbstractAccessDecisionManager
![](https://upload-images.jianshu.io/upload_images/4685968-5542a43d6bc8afaa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-62b75e5e53eae08b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
核心方法
![](https://upload-images.jianshu.io/upload_images/4685968-0aba636a0b776fea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
其中的决策类类型-投票器
![](https://upload-images.jianshu.io/upload_images/4685968-5b0b73c4cc75e7e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看一下最常见的投票器
![](https://upload-images.jianshu.io/upload_images/4685968-3516a189124098c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-672dc302d1ee3822.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![定义了权限前缀](https://upload-images.jianshu.io/upload_images/4685968-26e73f05e4f15816.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
核心方法自然为选举方法
![](https://upload-images.jianshu.io/upload_images/4685968-7c1d7ba10c22754a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

三大投票器
## AffirmativeBased
一票通过
![](https://upload-images.jianshu.io/upload_images/4685968-87189e8d969d8501.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
/**
 * Simple concrete implementation of
 * {@link org.springframework.security.access.AccessDecisionManager} that grants access if
 * any <code>AccessDecisionVoter</code> returns an affirmative response.
 */
public class AffirmativeBased extends AbstractAccessDecisionManager {

	public AffirmativeBased(List<AccessDecisionVoter<? extends Object>> decisionVoters) {
		super(decisionVoters);
	}

	// ~ Methods
	// ========================================================================================================

	/**
	 * This concrete implementation simply polls all configured
	 * {@link AccessDecisionVoter}s and grants access if any
	 * <code>AccessDecisionVoter</code> voted affirmatively. Denies access only if there
	 * was a deny vote AND no affirmative votes.
	 * <p>
	 * If every <code>AccessDecisionVoter</code> abstained from voting, the decision will
	 * be based on the {@link #isAllowIfAllAbstainDecisions()} property (defaults to
	 * false).
	 * </p>
	 *
	 * @param authentication the caller invoking the method
	 * @param object the secured object
	 * @param configAttributes the configuration attributes associated with the method
	 * being invoked
	 *
	 * @throws AccessDeniedException if access is denied
	 */
	public void decide(Authentication authentication, Object object,
			Collection<ConfigAttribute> configAttributes) throws AccessDeniedException {
		int deny = 0;

		for (AccessDecisionVoter voter : getDecisionVoters()) {
			int result = voter.vote(authentication, object, configAttributes);

			if (logger.isDebugEnabled()) {
				logger.debug("Voter: " + voter + ", returned: " + result);
			}

			switch (result) {
			case AccessDecisionVoter.ACCESS_GRANTED:
				return;

			case AccessDecisionVoter.ACCESS_DENIED:
				deny++;

				break;

			default:
				break;
			}
		}

		if (deny > 0) {
			throw new AccessDeniedException(messages.getMessage(
					"AbstractAccessDecisionManager.accessDenied", "Access is denied"));
		}

		// To get this far, every AccessDecisionVoter abstained
		checkAllowIfAllAbstainDecisions();
	}
}
```
## ConsensusBased
一半以上功能选举通过
![](https://upload-images.jianshu.io/upload_images/4685968-b0a35c92a4cbcefd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
/**
 * Simple concrete implementation of
 * {@link org.springframework.security.access.AccessDecisionManager} that uses a
 * consensus-based approach.
 * <p>
 * "Consensus" here means majority-rule (ignoring abstains) rather than unanimous
 * agreement (ignoring abstains). If you require unanimity, please see
 * {@link UnanimousBased}.
 */
public class ConsensusBased extends AbstractAccessDecisionManager {
	// ~ Instance fields
	// ================================================================================================

	private boolean allowIfEqualGrantedDeniedDecisions = true;

	public ConsensusBased(List<AccessDecisionVoter<? extends Object>> decisionVoters) {
		super(decisionVoters);
	}

	// ~ Methods
	// ========================================================================================================

	/**
	 * This concrete implementation simply polls all configured
	 * {@link AccessDecisionVoter}s and upon completion determines the consensus of
	 * granted against denied responses.
	 * <p>
	 * If there were an equal number of grant and deny votes, the decision will be based
	 * on the {@link #isAllowIfEqualGrantedDeniedDecisions()} property (defaults to true).
	 * <p>
	 * If every <code>AccessDecisionVoter</code> abstained from voting, the decision will
	 * be based on the {@link #isAllowIfAllAbstainDecisions()} property (defaults to
	 * false).
	 *
	 * @param authentication the caller invoking the method
	 * @param object the secured object
	 * @param configAttributes the configuration attributes associated with the method
	 * being invoked
	 *
	 * @throws AccessDeniedException if access is denied
	 */
	public void decide(Authentication authentication, Object object,
			Collection<ConfigAttribute> configAttributes) throws AccessDeniedException {
		int grant = 0;
		int deny = 0;
		int abstain = 0;

		for (AccessDecisionVoter voter : getDecisionVoters()) {
			int result = voter.vote(authentication, object, configAttributes);

			if (logger.isDebugEnabled()) {
				logger.debug("Voter: " + voter + ", returned: " + result);
			}

			switch (result) {
			case AccessDecisionVoter.ACCESS_GRANTED:
				grant++;

				break;

			case AccessDecisionVoter.ACCESS_DENIED:
				deny++;

				break;

			default:
				abstain++;

				break;
			}
		}

		if (grant > deny) {
			return;
		}

		if (deny > grant) {
			throw new AccessDeniedException(messages.getMessage(
					"AbstractAccessDecisionManager.accessDenied", "Access is denied"));
		}

		if ((grant == deny) && (grant != 0)) {
			if (this.allowIfEqualGrantedDeniedDecisions) {
				return;
			}
			else {
				throw new AccessDeniedException(messages.getMessage(
						"AbstractAccessDecisionManager.accessDenied", "Access is denied"));
			}
		}

		// To get this far, every AccessDecisionVoter abstained
		checkAllowIfAllAbstainDecisions();
	}

	public boolean isAllowIfEqualGrantedDeniedDecisions() {
		return allowIfEqualGrantedDeniedDecisions;
	}

	public void setAllowIfEqualGrantedDeniedDecisions(
			boolean allowIfEqualGrantedDeniedDecisions) {
		this.allowIfEqualGrantedDeniedDecisions = allowIfEqualGrantedDeniedDecisions;
	}
}
```
## UnanimousBased
全票通过才可
![](https://upload-images.jianshu.io/upload_images/4685968-9754fb7788ddb8f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
/**
 * Simple concrete implementation of
 * {@link org.springframework.security.access.AccessDecisionManager} that requires all
 * voters to abstain or grant access.
 */
public class UnanimousBased extends AbstractAccessDecisionManager {

	public UnanimousBased(List<AccessDecisionVoter<? extends Object>> decisionVoters) {
		super(decisionVoters);
	}

	// ~ Methods
	// ========================================================================================================

	/**
	 * This concrete implementation polls all configured {@link AccessDecisionVoter}s for
	 * each {@link ConfigAttribute} and grants access if <b>only</b> grant (or abstain)
	 * votes were received.
	 * <p>
	 * Other voting implementations usually pass the entire list of
	 * <tt>ConfigAttribute</tt>s to the <code>AccessDecisionVoter</code>. This
	 * implementation differs in that each <code>AccessDecisionVoter</code> knows only
	 * about a single <code>ConfigAttribute</code> at a time.
	 * <p>
	 * If every <code>AccessDecisionVoter</code> abstained from voting, the decision will
	 * be based on the {@link #isAllowIfAllAbstainDecisions()} property (defaults to
	 * false).
	 *
	 * @param authentication the caller invoking the method
	 * @param object the secured object
	 * @param attributes the configuration attributes associated with the method being
	 * invoked
	 *
	 * @throws AccessDeniedException if access is denied
	 */
	public void decide(Authentication authentication, Object object,
			Collection<ConfigAttribute> attributes) throws AccessDeniedException {

		int grant = 0;
		int abstain = 0;

		List<ConfigAttribute> singleAttributeList = new ArrayList<>(1);
		singleAttributeList.add(null);

		for (ConfigAttribute attribute : attributes) {
			singleAttributeList.set(0, attribute);

			for (AccessDecisionVoter voter : getDecisionVoters()) {
				int result = voter.vote(authentication, object, singleAttributeList);

				if (logger.isDebugEnabled()) {
					logger.debug("Voter: " + voter + ", returned: " + result);
				}

				switch (result) {
				case AccessDecisionVoter.ACCESS_GRANTED:
					grant++;

					break;

				case AccessDecisionVoter.ACCESS_DENIED:
					throw new AccessDeniedException(messages.getMessage(
							"AbstractAccessDecisionManager.accessDenied",
							"Access is denied"));

				default:
					abstain++;

					break;
				}
			}
		}

		// To get this far, there were no deny votes
		if (grant > 0) {
			return;
		}

		// To get this far, every AccessDecisionVoter abstained
		checkAllowIfAllAbstainDecisions();
	}
}
```
