package app.security;

import app.auth.session.service.SessionService;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final SessionService sessionService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   SessionService sessionService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);

        if (token != null && jwtTokenProvider.isValid(token)) {
            Claims claims = jwtTokenProvider.parseClaims(token);
            String username = claims.getSubject();
            String role = (String) claims.get("role");
            String sid = claimString(claims, "sid");
            String jti = claimString(claims, "jti");
            String tokenType = claimString(claims, "type");

            if (!"access".equalsIgnoreCase(tokenType)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (!StringUtils.hasText(username)
                    || !StringUtils.hasText(role)
                    || !StringUtils.hasText(sid)
                    || !StringUtils.hasText(jti)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (!sessionService.isAccessTokenAliveAndTouch(username, sid, jti)) {
                filterChain.doFilter(request, response);
                return;
            }

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
            );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (SessionService.ACCESS_TOKEN_COOKIE.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String claimString(Claims claims, String key) {
        Object value = claims.get(key);
        return value == null ? null : String.valueOf(value);
    }
}
